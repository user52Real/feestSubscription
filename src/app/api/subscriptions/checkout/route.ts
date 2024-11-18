import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/types/subscription";
import dbConnect from "@/lib/db/connection";
import { Subscription } from "@/lib/db/models/subscription";

const billingUrl = absoluteUrl("/settings/subscription");

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  stripePriceId?: string;
  limits: {
    eventsPerMonth: number;
    guestsPerEvent: number;
    features: string[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { planId } = await req.json();
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS] as SubscriptionPlan;

    if (!plan) {
      return new NextResponse("Invalid plan selected", { status: 400 });
    }

    // Check if plan is free
    if (plan.id === 'free') {
      return new NextResponse("Cannot create checkout session for free plan", { status: 400 });
    }

    // Verify stripePriceId exists for paid plans
    if (!plan.stripePriceId) {
      return new NextResponse("Invalid plan configuration", { status: 400 });
    }

    // Get user from Clerk
    const user = await (await clerkClient()).users.getUser(userId);
    const email = user.emailAddresses[0].emailAddress;

    await dbConnect();

    // Check existing subscription
    const existingSubscription = await Subscription.findOne({ 
      userId,
      status: { $in: ['active', 'trialing'] }
    });

    if (existingSubscription?.stripeSubscriptionId) {
      return new NextResponse("Active subscription exists", { status: 400 });
    }

    // Get or create customer
    let customerId = existingSubscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          clerkId: userId,
          planId
        }
      });
      customerId = customer.id;

      // Create or update subscription record
      await Subscription.findOneAndUpdate(
        { userId },
        {
          userId,
          planId,
          plan: planId.toLowerCase(),
          stripeCustomerId: customerId,
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
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${billingUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${billingUrl}?canceled=true`,
      subscription_data: {
        metadata: {
          userId,
          planId
        },
        trial_period_days: 14 // Optional: Remove if you don't want to offer a trial
      },
      metadata: {
        userId,
        planId
      }
    });

    return NextResponse.json({ 
      sessionId: session.id,
      customerId 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}