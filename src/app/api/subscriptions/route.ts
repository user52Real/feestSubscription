import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOrUpdateSubscription, getCurrentSubscription } from '@/lib/subscription/subscription-service';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    
    // Validate the request body
    if (!body.plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    const subscriptionData = {
      userId,
      plan: body.plan,
      planId: body.planId,
      stripePriceId: body.stripePriceId,
      currentPeriodEnd: body.currentPeriodEnd ? new Date(body.currentPeriodEnd) : undefined,
      status: body.status || 'active',
      stripeCustomerId: body.stripeCustomerId,
      stripeSubscriptionId: body.stripeSubscriptionId
    };

    const subscription = await createOrUpdateSubscription(userId, subscriptionData);

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Subscription error:', error);
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to update subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await getCurrentSubscription(userId);
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}