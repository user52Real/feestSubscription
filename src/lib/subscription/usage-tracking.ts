import dbConnect from "@/lib/db/connection";
import { Subscription } from "@/lib/db/models/subscription";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/types/subscription";
import { getCurrentSubscription } from "./subscription-service";
import { Event } from "@/lib/db/models/event";

// Add type for usage tracking
interface UsageMetrics {
  eventsCreated: number;
  totalGuests: number;
  lastReset: Date;
}

export async function trackUsage(userId: string, action: 'event' | 'guest') {
    try {
      const subscription = await Subscription.findOne({ userId });
      if (!subscription) return true;
  
      // Reset usage if in new billing period
      const now = new Date();
      if (now > subscription.currentPeriodEnd) {
        subscription.usage = {
          eventsCreated: 0,
          totalGuests: 0,
          lastReset: now
        } as UsageMetrics;
      }
  
      const plan = SUBSCRIPTION_PLANS[subscription.planId as keyof typeof SUBSCRIPTION_PLANS];
      
      if (action === 'event') {
        if (plan.limits.eventsPerMonth !== -1 && 
            subscription.usage.eventsCreated >= plan.limits.eventsPerMonth) {
          return false;
        }
        subscription.usage.eventsCreated += 1;
      } else if (action === 'guest') {
        subscription.usage.totalGuests += 1;
      }
  
      await subscription.save();
      return true;
    } catch (error) {
      console.error("Error tracking usage:", error);
      return false;
    }
}

export async function trackEventCreation(userId: string): Promise<boolean> {
    try {
      await dbConnect();
      const subscription = await getCurrentSubscription(userId);
      const plan = (subscription?.plan || 'free') as SubscriptionTier;
      
      // Fix the countDocuments error by using the Mongoose model
      const eventCount = await Event.countDocuments({ 
        organizerId: userId 
      });
      
      // Fix the indexing error by ensuring plan is a valid key
      const maxEvents = FEATURE_GATES.max_events[plan];
      if (typeof maxEvents !== 'number') {
        return false;
      }
      
      return eventCount < maxEvents;
    } catch (error) {
      console.error('Error tracking event creation:', error);
      return false;
    }
}

// Add type definition for FEATURE_GATES
export type FeatureGatesType = {
  max_events: Record<SubscriptionTier, number>;
  features: Record<SubscriptionTier, string[]>;
}

// Update your feature-gates.ts file to include the type
export const FEATURE_GATES: FeatureGatesType = {
  max_events: {
    FREE: 2,
    PRO: 10,
    BUSINESS: -1
  },
  features: {
    FREE: ['basic_analytics', 'email_invites'],
    PRO: [
      'basic_analytics',
      'email_invites',
      'custom_branding',
      'advanced_analytics'
    ],
    BUSINESS: [
      'basic_analytics',
      'email_invites',
      'custom_branding',
      'advanced_analytics',
      'priority_support'
    ]
  }
};