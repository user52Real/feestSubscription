import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Feature, SUBSCRIPTION_PLANS } from "@/types/subscription";
import { Subscription } from "@/lib/db/models/subscription";
import { SubscriptionTier } from "@/types/subscription";

export type FeatureGatesType = {
  max_events: Record<SubscriptionTier, number>;
  features: Record<SubscriptionTier, string[]>;
}


export const SUBSCRIPTION_FEATURES = {
  FREE: {
    maxEvents: 1,
    maxGuestsPerEvent: 20,
    features: ['basic_analytics', 'email_invites']
  },
  PRO: {
    maxEvents: 10,
    maxGuestsPerEvent: 100,
    features: ['advanced_analytics', 'custom_branding', 'export_data']
  },
  ENTERPRISE: {
    maxEvents: -1, 
    maxGuestsPerEvent: -1,
    features: ['all']
  }
};


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

export async function checkFeatureAccess(feature: Feature, RECURRING_EVENTS: string): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return SUBSCRIPTION_PLANS.FREE.limits.features.includes(feature);
    }

    const plan = SUBSCRIPTION_PLANS[subscription.planId as keyof typeof SUBSCRIPTION_PLANS];
    return plan.limits.features.includes(feature);
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

export function withFeatureAccess(feature: Feature) {
  return async function middleware(request: Request) {
    const hasAccess = await checkFeatureAccess(feature, 'RECURRING_EVENTS');
    
    if (!hasAccess) {
      return new NextResponse("Feature not available in your plan", { status: 403 });
    }

    return NextResponse.next();
  };
}



export function hasFeatureAccess(subscription: { plan?: string } | null, feature: string): boolean {
    if (!subscription) return false;
    const plan = subscription.plan || 'free';
    return FEATURE_GATES.features[plan as keyof typeof FEATURE_GATES.features].includes(feature);
}