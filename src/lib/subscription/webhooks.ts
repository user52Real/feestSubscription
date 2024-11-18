// src/lib/subscription/webhooks.ts
import { stripe } from "@/lib/stripe";
import { createOrUpdateSubscription } from "./subscription-service";
import { Subscription } from "../db/models/subscription";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/types/subscription";

interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_end: number;
  current_period_start: number;
  metadata: {
    userId: string;
    planId: SubscriptionTier;
  };
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
}

export async function handleStripeWebhook(event: { type: string; data: { object: StripeSubscription } }) {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Map Stripe subscription to our subscription model
        await createOrUpdateSubscription(
          subscription.metadata.userId,
          {
            userId: subscription.metadata.userId,
            planId: subscription.metadata.planId,
            plan: subscription.metadata.planId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: 'canceled',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              features: SUBSCRIPTION_PLANS.FREE.limits.features, // Reset to free features
              plan: 'FREE' as SubscriptionTier,
              usage: {
                eventsCreated: 0,
                totalGuests: 0,
                lastReset: new Date()
              }
            }
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const subscription = event.data.object;
        
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: 'past_due',
              features: [] // Remove features on payment failure
            }
          }
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const subscription = event.data.object;
        
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: 'active',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              usage: {
                eventsCreated: 0,
                totalGuests: 0,
                lastReset: new Date()
              }
            }
          }
        );
        break;
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}