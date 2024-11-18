import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { handleApiError, ApiError } from '@/lib/api/error-handler';
import { analyzeQueryPerformance } from '@/lib/db/utils/performance';
import { trackEventCreation } from "@/lib/subscription/usage-tracking";
import { checkFeatureAccess } from "@/lib/subscription/feature-gates";
import { FEATURES, SUBSCRIPTION_PLANS, SubscriptionTier, SubscriptionStatus } from "@/types/subscription";
import { getCurrentSubscription } from "@/lib/subscription/subscription-service";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const subscription = await getCurrentSubscription(userId);
    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ApiError('Invalid subscription', 403, 'INVALID_SUBSCRIPTION');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS];
    
    // Check if user has recurring events feature
    if (!plan.limits.features.includes(FEATURES.RECURRING_EVENTS)) {
      throw new ApiError(
        'Recurring events feature not available in your plan',
        403,
        'FEATURE_NOT_AVAILABLE'
      );
    }

    // Check monthly event creation limit
    if (subscription.usage.eventsCreated >= plan.limits.eventsPerMonth) {
      throw new ApiError(
        `Monthly event limit reached (${plan.limits.eventsPerMonth} events)`,
        403,
        'EVENT_LIMIT_REACHED'
      );
    }

    await dbConnect();
    const data = await req.json();

    // Validate guest capacity against plan limits
    if (data.capacity > plan.limits.guestsPerEvent) {
      throw new ApiError(
        `Guest limit exceeded (max: ${plan.limits.guestsPerEvent})`,
        403,
        'GUEST_LIMIT_EXCEEDED'
      );
    }

    // Validate advance booking days
    const eventStartDate = new Date(data.startDate);
    const maxAdvanceDays = plan.limits.maxAdvanceBookingDays;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

    if (eventStartDate > maxDate) {
      throw new ApiError(
        `Cannot create events more than ${maxAdvanceDays} days in advance`,
        403,
        'ADVANCE_BOOKING_EXCEEDED'
      );
    }

    // Create event with plan-specific features
    const event = await Event.create({
      ...data,
      organizerId: userId,
      status: "draft",
      location: {
        venue: data.venue,
        address: data.address
      },
      features: {
        waitlist: plan.limits.features.includes(FEATURES.WAITLIST),
        customBranding: plan.limits.features.includes(FEATURES.CUSTOM_BRANDING),
        multiOrganizer: plan.limits.features.includes(FEATURES.MULTI_ORGANIZER)
      }
    });   

    // Track event creation for usage limits
    await trackEventCreation(userId);

    // Format response
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
      features: event.features
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

    const subscription = await getCurrentSubscription(userId);
    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ApiError('Invalid subscription', 403, 'INVALID_SUBSCRIPTION');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS];

    // Verify basic analytics access
    if (!plan.limits.features.includes(FEATURES.BASIC_ANALYTICS)) {
      throw new ApiError(
        'Analytics feature not available in your plan',
        403,
        'FEATURE_NOT_AVAILABLE'
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const organizerId = searchParams.get("organizerId");

    let query: any = { organizerId: userId };
    if (status) query.status = status;
    if (organizerId && plan.limits.features.includes(FEATURES.MULTI_ORGANIZER)) {
      query.organizerId = organizerId;
    }

    const limit = plan.limits.eventsPerMonth === Infinity ? 
      100 : plan.limits.eventsPerMonth;

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
      features: event.features
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