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
  
  export enum SubscriptionTier {
    FREE = 'FREE',
    PRO = 'PRO',
    BUSINESS = 'BUSINESS'
  }
  
  export enum SubscriptionStatus {
    INCOMPLETE = 'incomplete',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    TRIALING = 'trialing',
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELED = 'canceled',
    UNPAID = 'unpaid'
  }
  
  export interface SubscriptionPlan {
    id: SubscriptionTier;
    name: string;
    description: string;
    price: number;
    stripePriceId: string | null;
    trialDays?: number;
    status?: SubscriptionStatus;
    features: string[];
    limits: {
      maxAdvanceBookingDays: number;
      eventsPerMonth: number;
      guestsPerEvent: number;
      features: Feature[];
    };
  }
  
  export type SubscriptionPlansType = {
    [K in SubscriptionTier]: Omit<SubscriptionPlan, 'id' | 'status'>;
  };
  
  export const SUBSCRIPTION_PLANS: SubscriptionPlansType = {
    [SubscriptionTier.FREE]: {
      name: 'Free',
      description: 'For individuals just getting started',
      price: 0,
      stripePriceId: null,
      trialDays: 0,
      features: ['Up to 3 events', 'Basic analytics', 'Email support'],
      limits: {
        eventsPerMonth: 3,
        guestsPerEvent: 50,
        maxAdvanceBookingDays: 30,
        features: [FEATURES.BASIC_ANALYTICS]
      }
    },
    [SubscriptionTier.PRO]: {
      name: 'Pro',
      description: 'For growing organizations',
      price: 29,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null,
      trialDays: 14,
      features: ['Up to 50 events', 'Advanced analytics', 'Priority support'],
      limits: {
        eventsPerMonth: 50,
        guestsPerEvent: 200,
        maxAdvanceBookingDays: 90,
        features: [
          FEATURES.BASIC_ANALYTICS,
          FEATURES.ADVANCED_ANALYTICS,
          FEATURES.EMAIL_INVITES,
          FEATURES.RECURRING_EVENTS
        ]
      }
    },
    [SubscriptionTier.BUSINESS]: {
      name: 'Business',
      description: 'For large organizations',
      price: 99,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || null,
      trialDays: 14,
      features: ['Unlimited events', 'Custom analytics', 'Dedicated support'],
      limits: {
        eventsPerMonth: Infinity,
        guestsPerEvent: Infinity,
        maxAdvanceBookingDays: 365,
        features: [
            FEATURES.BASIC_ANALYTICS,
            FEATURES.ADVANCED_ANALYTICS,
            FEATURES.EMAIL_INVITES,
            FEATURES.RECURRING_EVENTS,
            FEATURES.CUSTOM_BRANDING,
            FEATURES.API_ACCESS,
            FEATURES.MULTI_ORGANIZER,
            FEATURES.WAITLIST
        ]
      }
    }
  } as const;
  
  // Helper type for the subscription hook
  export interface SubscriptionData {
    plan: SubscriptionTier;
    status: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd: Date;
    isCanceled?: boolean;
    usage: {
      eventsCreated: number;
      totalGuests: number;
      lastReset: Date;
    };
    limits: {
      maxEvents: number;
      maxGuestsPerEvent: number;
    };
  }