// src/app/api/subscriptions/portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import dbConnect from "@/lib/db/connection";
import { Subscription } from "@/lib/db/models/subscription";
import { handleApiError, ApiError } from '@/lib/api/error-handler';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/types/subscription";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    await dbConnect();
    
    // Find active subscription
    const subscription = await Subscription.findOne({ 
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] }
    });

    if (!subscription?.stripeCustomerId) {
      throw new ApiError('No active subscription found', 404, 'SUBSCRIPTION_NOT_FOUND');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan as SubscriptionTier];

    // Create portal configuration based on plan
    const portalConfiguration = {
      business_profile: {
        headline: `Manage your ${plan.name} subscription`,
      },
      features: {
        subscription_update: {
          enabled: true,
          products: [process.env.STRIPE_PRODUCT_ID!]
        },
        payment_method_update: {
          enabled: true
        },
        customer_update: {
          enabled: true,
          allowed_updates: ['email', 'address']
        },
        invoice_history: {
          enabled: true
        }
      }
    };

    // Create Stripe portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: absoluteUrl("/settings/subscription"),
      configuration: subscription.plan === 'BUSINESS' ? 
        process.env.STRIPE_BUSINESS_PORTAL_CONFIG :
        process.env.STRIPE_STANDARD_PORTAL_CONFIG,
      flow_data: {
        type: 'subscription_cancel',
        subscription_cancel: {
          subscription: subscription.stripeSubscriptionId!
        }
      }
    });

    return NextResponse.json({ 
      url: session.url,
      customerId: subscription.stripeCustomerId,
      planId: subscription.plan
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return handleApiError(error);
  }
}