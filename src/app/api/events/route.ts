import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { handleApiError, ApiError } from '@/lib/api/error-handler';
import { analyzeQueryPerformance } from '@/lib/db/utils/performance';
import { trackEventCreation } from "@/lib/subscription/usage-tracking";
import { checkFeatureAccess } from "@/lib/subscription/feature-gates";
import { FEATURES, SUBSCRIPTION_PLANS, SubscriptionTier } from "@/types/subscription";
import { getCurrentSubscription } from "@/lib/subscription/subscription-service";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Get current subscription first
    const subscription = await getCurrentSubscription(userId);
    if (!subscription) {
      return new NextResponse(
        "Subscription not found", 
        { status: 403 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[subscription.planId as SubscriptionTier];
    
    // Check if user has permission to create events
    if (!plan.limits.features.includes(FEATURES.RECURRING_EVENTS)) {
      return new NextResponse(
        "Please upgrade your plan to create events.", 
        { status: 403 }
      );
    }

    // Check event creation limits
    try {
      await trackEventCreation(userId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Monthly event limit reached') {
        return new NextResponse(
          `Event limit reached (${plan.limits.eventsPerMonth} per month). Please upgrade your plan.`, 
          { status: 403 }
        );
      }
      throw error;
    }

    await dbConnect();

    const data = await req.json();

    // Validate the event data based on subscription limits
    if (data.capacity > plan.limits.guestsPerEvent) {
      return new NextResponse(
        `Guest limit exceeded. Your plan allows up to ${plan.limits.guestsPerEvent} guests per event.`,
        { status: 403 }
      );
    }

    // Create the event
    const event = await Event.create({
      ...data,
      organizerId: userId,
      status: "draft",
      location: {
        venue: data.venue,
        address: data.address
      }
    });   

    // Convert to response format
    const responseEvent = {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: {
        venue: event.location?.venue || '',
        address: event.location?.address || '',
      },
      capacity: event.capacity,
      status: event.status,
      visibility: event.visibility,
      organizerId: event.organizerId,
      coHosts: event.coHosts || [],
    };

    // Revalidate paths
    revalidatePath("/events");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return NextResponse.json(responseEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    return handleApiError(error);    
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Get current subscription
    const subscription = await getCurrentSubscription(userId);
    if (!subscription) {
      return new NextResponse(
        "Subscription not found", 
        { status: 403 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[subscription.planId as SubscriptionTier];

    // Check if user has access to view events
    if (!plan.limits.features.includes(FEATURES.BASIC_ANALYTICS)) {
      return new NextResponse(
        "Please upgrade your plan to view events.", 
        { status: 403 }
      );
    }

    await dbConnect();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const organizerId = searchParams.get("organizerId");

    // Build query
    let query: any = { organizerId: userId };
    if (status) query.status = status;
    if (organizerId) query.organizerId = organizerId;

    // Apply subscription limits
    const limit = plan.limits.eventsPerMonth === -1 ? 
      100 : // Default max for unlimited plans
      plan.limits.eventsPerMonth;

    const events = await Event.find(query)
      .sort({ startDate: -1 })
      .limit(limit);

    const serializedEvents = events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: {
        venue: event.location?.venue || '',
        address: event.location?.address || '',
      },
      capacity: event.capacity,
      status: event.status,
      visibility: event.visibility,
      organizerId: event.organizerId,
      coHosts: event.coHosts || [],
    }));

    return NextResponse.json({
      events: serializedEvents,
      total: events.length,
      limit,
      hasMore: events.length === limit
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    return handleApiError(error);
  }
}