import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/types/subscription";
import { absoluteUrl } from "@/lib/utils";
import { ApiError } from "@/lib/api/error-handler";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { planId } = await req.json();

    // Validate plan exists in SubscriptionTier enum
    if (!Object.values(SubscriptionTier).includes(planId as SubscriptionTier)) {
      throw new ApiError(
        'Invalid subscription plan selected',
        400,
        'INVALID_PLAN'
      );
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId as SubscriptionTier];

    // Check if plan is free
    if (planId === SubscriptionTier.FREE) {
      throw new ApiError(
        'Free plan cannot be purchased',
        400,
        'PLAN_NOT_PURCHASABLE'
      );
    }

    // Verify stripePriceId exists and is valid
    if (!plan.stripePriceId) {
      throw new ApiError(
        'Selected plan is not available for purchase',
        400,
        'PLAN_NOT_PURCHASABLE'
      );
    }

    // Get user's email from Clerk using clerkClient
    const user = await (await clerkClient()).users.getUser(userId);
    
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      throw new ApiError(
        'User email not found',
        400,
        'USER_EMAIL_NOT_FOUND'
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0].emailAddress,
      billing_address_collection: 'required',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId,
          planId
        },
        trial_period_days: plan.trialDays || undefined,
      },
      metadata: {
        userId,
        planId
      },
      success_url: absoluteUrl('/settings/subscription?success=true'),
      cancel_url: absoluteUrl('/settings/subscription?canceled=true'),
    });

    if (!session.url) {
      throw new ApiError(
        'Failed to create checkout session',
        500,
        'CHECKOUT_SESSION_CREATION_FAILED'
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code 
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}