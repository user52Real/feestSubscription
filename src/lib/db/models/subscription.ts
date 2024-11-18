import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: string;
  planId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  usage: {
    eventsCreated: number;
    totalGuests: number;
    activeEvents: number;
    storageUsed: number;
    lastReset: Date;
  };
  limits: {
    maxEvents: number;
    maxGuestsPerEvent: number;
    maxStorage: number;
    maxCoHosts: number;
  };
  features: {
    customBranding: boolean;
    advancedAnalytics: boolean;
    guestMessaging: boolean;
    eventChat: boolean;
    exportData: boolean;
    recurringEvents: boolean;
    waitlist: boolean;
    checkIn: boolean;
    guestReminders: boolean;
  };
}

const SubscriptionSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  planId: {
    type: String,
    required: true,
    default: 'free'
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'freee',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'incomplete', 'trialing'],
    default: 'incomplete'
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  stripePriceId: String,
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: Date.now
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialEndsAt: {
    type: Date
  },
  usage: {
    eventsCreated: { type: Number, default: 0 },
    totalGuests: { type: Number, default: 0 },
    activeEvents: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }, // in bytes
    lastReset: { type: Date, default: Date.now }
  },
  limits: {
    maxEvents: { type: Number, default: 1 },
    maxGuestsPerEvent: { type: Number, default: 20 },
    maxStorage: { type: Number, default: 100 * 1024 * 1024 }, // 100MB in bytes
    maxCoHosts: { type: Number, default: 0 }
  },
  features: {
    customBranding: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    guestMessaging: { type: Boolean, default: false },
    eventChat: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
    recurringEvents: { type: Boolean, default: false },
    waitlist: { type: Boolean, default: false },
    checkIn: { type: Boolean, default: false },
    guestReminders: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

// Add methods to check feature access
SubscriptionSchema.methods.hasFeature = function(featureName: string): boolean {
  return this.features[featureName] === true;
};

// Add methods to check usage limits
SubscriptionSchema.methods.canCreateEvent = function(): boolean {
  return this.usage.activeEvents < this.limits.maxEvents;
};

SubscriptionSchema.methods.canAddGuests = function(guestCount: number): boolean {
  return this.usage.totalGuests + guestCount <= this.limits.maxGuestsPerEvent;
};

export const Subscription = mongoose.models.Subscription || 
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);