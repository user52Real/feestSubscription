// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Subscription } from "@/lib/db/models/subscription";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// Define the expected Stripe event types
type StripeSubscriptionEvent = Stripe.Event & {
  type: 'customer.subscription.created' | 'customer.subscription.updated' | 'customer.subscription.deleted';
  data: {
    object: Stripe.Subscription;
  };
};

// Type guard to check if the event is a subscription event
function isSubscriptionEvent(event: Stripe.Event): event is StripeSubscriptionEvent {
  return [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ].includes(event.type);
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse('Missing signature or webhook secret', { status: 400 });
    }

    // 1. Validate webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await dbConnect();

    // 2. Handle different webhook events
    if (isSubscriptionEvent(event)) {
      const subscription = event.data.object;

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscription.id },
            {
              $set: {
                userId: subscription.metadata.userId,
                planId: subscription.metadata.planId,
                status: subscription.status,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              }
            },
            { upsert: true }
          );
          break;
        }

        case 'customer.subscription.deleted': {
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscription.id },
            {
              $set: {
                status: 'canceled',
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: true
              }
            }
          );
          break;
        }
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    if (error instanceof Stripe.errors.StripeError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Webhook Error', { status: 400 });
  }
}

export const config = {
  api: { bodyParser: false },
};