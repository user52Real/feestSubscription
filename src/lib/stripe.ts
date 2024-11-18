import Stripe from "stripe";
import { SubscriptionTier } from "@/types/subscription";

// Initialize Stripe with proper type checking for the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia', 
  typescript: true,
  appInfo: {
    name: "Feest App",
    version: "1.0.0",
  },
});

// Define strict types for helper function parameters
interface CustomerMetadata {
  userId: string;
  [key: string]: string;
}

interface CheckoutSessionParams {
  customerId: string;
  priceId: string;
  userId: string;
  planId: SubscriptionTier;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}

export const stripeHelpers = {
  async getOrCreateCustomer(
    userId: string, 
    email: string, 
    metadata: Partial<CustomerMetadata> = {}
  ): Promise<Stripe.Customer> {
    try {
      const customers = await stripe.customers.search({
        query: `metadata['userId']:'${userId}'`,
        limit: 1,
      });

      if (customers.data.length > 0) {
        return customers.data[0];
      }

      return await stripe.customers.create({
        email,
        metadata: {
          userId,
          ...metadata,
        },
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeError('Failed to create/get customer', error);
      }
      throw error;
    }
  },

  async createCheckoutSession({
    customerId,
    priceId,
    userId,
    planId,
    successUrl,
    cancelUrl,
    trialDays = 0,
  }: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    try {
      return await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          trial_period_days: trialDays,
          metadata: {
            userId,
            planId,
          },
        },
        metadata: {
          userId,
          planId,
        },
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeError('Failed to create checkout session', error);
      }
      throw error;
    }
  },

  async createBillingPortalSession(
    customerId: string, 
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeError('Failed to create billing portal session', error);
      }
      throw error;
    }
  },

  async getSubscription(subscriptionId: string): Promise<StripeSubscriptionWithCustomer> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer'],
      });
      return subscription as StripeSubscriptionWithCustomer;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeError('Failed to retrieve subscription', error);
      }
      throw error;
    }
  },

  async handleFailedPayment(subscriptionId: string, invoiceId: string): Promise<void> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      
      if (invoice.attempt_count === 1) {
        // Instead of manually setting next_payment_attempt,
        // update the subscription's collection method
        await stripe.subscriptions.update(subscriptionId, {
          collection_method: 'charge_automatically',
          payment_settings: {
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription'
          }
        });
      } else {
        // After multiple failures, cancel the subscription
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: 'payment_failure'
          }
        });
      }
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeError('Failed to handle payment failure', error);
      }
      throw error;
    }
  },

  async retryFailedPayment(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      // Use pay instead of updating next_payment_attempt
      return await stripe.invoices.pay(invoiceId, {
        payment_method: 'pm_card_visa' // Replace with actual payment method
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeError('Failed to retry payment', error);
      }
      throw error;
    }
  },

  validateWebhookSignature(
    payload: string | Buffer, 
    signature: string, 
    secret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeError('Invalid webhook signature', error);
      }
      throw error;
    }
  },
};

// Type definitions
export interface StripeSubscriptionWithCustomer extends Stripe.Subscription {
  customer: Stripe.Customer;
}

export interface StripeInvoiceWithSubscription extends Stripe.Invoice {
  subscription: Stripe.Subscription;
}

// Custom error class
export class StripeError extends Error {
  constructor(
    message: string,
    public readonly stripeError: Stripe.errors.StripeError
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

// Webhook event types
export const STRIPE_WEBHOOK_EVENTS = {
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',
  CHECKOUT_COMPLETED: 'checkout.session.completed',
} as const;

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[keyof typeof STRIPE_WEBHOOK_EVENTS];