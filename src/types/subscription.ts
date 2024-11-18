// src/types/subscription.ts
export const FEATURES = {
  BASIC_ANALYTICS: 'basic_analytics',
  EMAIL_INVITES: 'email_invites',
  CUSTOM_BRANDING: 'custom_branding',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  PRIORITY_SUPPORT: 'priority_support',
  QR_CHECKIN: 'qr_checkin',
  EXPORT_FEATURES: 'export_features',
  RECURRING_EVENTS: 'recurring_events',
  WAITLIST: 'waitlist',
  MULTI_ORGANIZER: 'multi_organizer',
  API_ACCESS: 'api_access'
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  stripePriceId?: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  limits: {
      eventsPerMonth: number;
      guestsPerEvent: number;
      features: Feature[];
  };
}

export type SubscriptionTier = 'FREE' | 'PRO' | 'BUSINESS';

// Update the subscription plans to match the SubscriptionPlan interface
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  FREE: {
      id: 'free',
      name: 'Free',
      price: 0,
      stripePriceId: undefined,
      plan: 'free',
      status: 'active',
      limits: {
          eventsPerMonth: 2,
          guestsPerEvent: 50,
          features: [
              FEATURES.BASIC_ANALYTICS,
              FEATURES.EMAIL_INVITES
          ]
      }
  },
  PRO: {
      id: 'pro',
      name: 'Pro',
      price: 29,
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
      plan: 'pro',
      status: 'active',
      limits: {
          eventsPerMonth: 10,
          guestsPerEvent: 200,
          features: [
              FEATURES.BASIC_ANALYTICS,
              FEATURES.EMAIL_INVITES,
              FEATURES.CUSTOM_BRANDING,
              FEATURES.ADVANCED_ANALYTICS,
              FEATURES.PRIORITY_SUPPORT,
              FEATURES.QR_CHECKIN,
              FEATURES.EXPORT_FEATURES,
              FEATURES.RECURRING_EVENTS,
              FEATURES.WAITLIST
          ]
      }
  },
  BUSINESS: {
      id: 'business',
      name: 'Business',
      price: 99,
      stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID,
      plan: 'business',
      status: 'active',
      limits: {
          eventsPerMonth: -1,
          guestsPerEvent: 1000,
          features: [
              FEATURES.BASIC_ANALYTICS,
              FEATURES.EMAIL_INVITES,
              FEATURES.CUSTOM_BRANDING,
              FEATURES.ADVANCED_ANALYTICS,
              FEATURES.PRIORITY_SUPPORT,
              FEATURES.QR_CHECKIN,
              FEATURES.EXPORT_FEATURES,
              FEATURES.RECURRING_EVENTS,
              FEATURES.WAITLIST,
              FEATURES.MULTI_ORGANIZER,
              FEATURES.API_ACCESS
          ]
      }
  }
} as const;