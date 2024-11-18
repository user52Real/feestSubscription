import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Subscription } from "@/lib/db/models/subscription";
import { stripe } from "@/lib/stripe";
import { SUBSCRIPTION_PLANS } from "@/types/subscription";

interface UsageLimits {
  canCreateEvent: boolean;
  canInviteGuests: boolean;
  isWithinLimits: boolean;
}

interface SubscriptionUpdate {
  userId: string;
  planId?: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS'; 
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  status?: string;
  currentPeriodEnd?: Date;
}

// Helper function to check if usage limits are exceeded
export async function checkUsageLimits(subscription: any): Promise<UsageLimits> {
  const plan = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS];
  
  // Reset usage if we're in a new billing period
  if (new Date(subscription.usage.lastReset) < subscription.currentPeriodStart) {
    subscription.usage = {
      eventsCreated: 0,
      totalGuests: 0,
      lastReset: new Date()
    };
    await subscription.save();
  }

  return {
    canCreateEvent: subscription.usage.eventsCreated < plan.limits.eventsPerMonth,
    canInviteGuests: subscription.usage.totalGuests < plan.limits.guestsPerEvent,
    isWithinLimits: true
  };
}

export async function getCurrentSubscription(userId: string) {
  try {
    await dbConnect();
    
    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      // Create a default subscription with a default planId
      subscription = new Subscription({
        userId,
        planId: 'price_free',
        plan: 'FREE',
        status: 'active',
        features: SUBSCRIPTION_PLANS.FREE.limits.features || [],
        limits: {
          maxEvents: SUBSCRIPTION_PLANS.FREE.limits.eventsPerMonth,
          maxGuestsPerEvent: SUBSCRIPTION_PLANS.FREE.limits.guestsPerEvent
        },
        usage: {
          eventsCreated: 0,
          totalGuests: 0,
          lastReset: new Date()
        },
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: null
      });
      await subscription.save();
    }
    
    return subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
}

export async function createOrUpdateSubscription(userId: string, params: SubscriptionUpdate) {
  try {
    await dbConnect();
    
    // Validate required parameters
    if (!params || !params.plan) {
      throw new Error('Plan is required for subscription update');
    }

    const user = await (await clerkClient()).users.getUser(userId);    
    const plan = SUBSCRIPTION_PLANS[params.plan];

    if (!plan) {
      throw new Error(`Invalid plan selected: ${params.plan}`);
    }

    const subscriptionData = {
      userId,
      planId: params.planId,
      plan: params.plan,
      stripePriceId: params.stripePriceId,
      status: params.status || 'active',
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      email: user.emailAddresses[0].emailAddress,
      currentPeriodStart: new Date(),
      currentPeriodEnd: params.currentPeriodEnd,
      features: plan.limits.features || [],
      limits: {
        maxEvents: plan.limits.eventsPerMonth,
        maxGuestsPerEvent: plan.limits.guestsPerEvent
      },
      usage: {
        eventsCreated: 0,
        totalGuests: 0,
        lastReset: new Date()
      }
    };

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      { $set: subscriptionData },
      { upsert: true, new: true }
    );

    return subscription;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

export async function updateUsage(userId: string, updates: {
  eventsCreated?: number;
  totalGuests?: number;
}) {
  try {
    await dbConnect();
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      throw new Error("No subscription found");
    }

    const updatedUsage = {
      eventsCreated: subscription.usage.eventsCreated + (updates.eventsCreated || 0),
      totalGuests: subscription.usage.totalGuests + (updates.totalGuests || 0),
      lastReset: subscription.usage.lastReset
    };

    // Check if usage would exceed limits
    const plan = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS];
    if (
      (updatedUsage.eventsCreated > plan.limits.eventsPerMonth) ||
      (updatedUsage.totalGuests > plan.limits.guestsPerEvent)
    ) {
      throw new Error("Usage limit exceeded");
    }

    await Subscription.updateOne(
      { userId },
      { $set: { usage: updatedUsage } }
    );

    return updatedUsage;
  } catch (error) {
    console.error("Error updating usage:", error);
    throw error;
  }
}