// src/app/api/subscriptions/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import dbConnect from '@/lib/db/connection';
import { Subscription } from '@/lib/db/models/subscription';
import { absoluteUrl } from '@/lib/utils';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/types/subscription';
import { handleApiError, ApiError } from '@/lib/api/error-handler';

export async function POST(req: Request) {
  try {
    // 1. Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // 2. Get and validate request data
    const { planId } = await req.json();
    const plan = SUBSCRIPTION_PLANS[planId as SubscriptionTier];
    
    if (!plan?.stripePriceId) {
      throw new ApiError('Invalid plan selected', 400, 'INVALID_PLAN');
    }

    // 3. Get user from Clerk
    const user = await (await clerkClient()).users.getUser(userId);
    const email = user.emailAddresses[0].emailAddress;    

    await dbConnect();

    // 4. Check existing subscription
    const existingSubscription = await Subscription.findOne({ 
      userId,
      status: { $in: ['active', 'trialing'] }
    });

    if (existingSubscription?.stripeSubscriptionId) {
      throw new ApiError(
        'Active subscription exists', 
        400, 
        'SUBSCRIPTION_EXISTS'
      );
    }

    // 5. Get or create Stripe customer
    let customer;
    if (existingSubscription?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          clerkId: userId,
          planId
        }
      });
    }

    // 6. Create or update subscription record with plan features
    await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        planId,
        plan: planId as SubscriptionTier,
        stripeCustomerId: customer.id,
        status: 'incomplete',
        features: plan.limits.features,
        limits: {
          maxEvents: plan.limits.eventsPerMonth,
          maxGuestsPerEvent: plan.limits.guestsPerEvent
        },
        usage: {
          eventsCreated: 0,
          totalGuests: 0,
          lastReset: new Date()
        }
      },
      { upsert: true }
    );

    // 7. Create checkout session with proper metadata
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: absoluteUrl('/settings/subscription?success=true'),
      cancel_url: absoluteUrl('/settings/subscription?canceled=true'),
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          userId,
          planId,
          features: JSON.stringify(plan.limits.features),
          maxEvents: plan.limits.eventsPerMonth,
          maxGuestsPerEvent: plan.limits.guestsPerEvent
        },
        trial_period_days: 14
      },
      metadata: {
        userId,
        planId
      }
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      customerId: customer.id 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return handleApiError(error);
  }
}