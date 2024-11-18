import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";
import { sendEventInvitation } from "@/lib/email/notifications";
import { createActivity } from "@/lib/activity/notifications";
import { formatDateTime } from "@/lib/email/notifications";
import { getCurrentSubscription } from "@/lib/subscription/subscription-service";
import { FEATURES, SUBSCRIPTION_PLANS, SubscriptionTier } from "@/types/subscription";
import { ApiError } from "@/lib/api/error-handler";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Get user's subscription
    const subscription = await getCurrentSubscription(userId);
    if (!subscription) {
      throw new ApiError('Subscription not found', 403, 'SUBSCRIPTION_NOT_FOUND');
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query: any = { eventId: params.eventId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const guests = await Guest.find(query).sort({ createdAt: -1 });
    return NextResponse.json(guests);
  } catch (error) {
    console.error("Error fetching guests:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Get user's subscription
    const subscription = await getCurrentSubscription(userId);
    if (!subscription) {
      throw new ApiError('Subscription not found', 403, 'SUBSCRIPTION_NOT_FOUND');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan as SubscriptionTier];

    await dbConnect();
    const data = await req.json();
    const event = await Event.findById(params.eventId);

    if (!event) {
      throw new ApiError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    // Check if user has permission to invite
    if (event.organizerId !== userId && !event.coHosts.includes(userId)) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Check if email invites feature is available
    if (!plan.limits.features.includes(FEATURES.EMAIL_INVITES)) {
      throw new ApiError(
        'Email invites not available in your plan',
        403,
        'FEATURE_NOT_AVAILABLE'
      );
    }

    // Get current guest count
    const currentGuests = await Guest.countDocuments({ eventId: params.eventId });
    
    // Handle batch invitations
    const emails = Array.isArray(data.email) ? data.email : [data.email];
    
    // Check if adding new guests would exceed the plan limit
    if (currentGuests + emails.length > plan.limits.guestsPerEvent) {
      throw new ApiError(
        `Guest limit exceeded. Your plan allows ${plan.limits.guestsPerEvent} guests per event.`,
        403,
        'GUEST_LIMIT_EXCEEDED'
      );
    }

    // Format event date and time
    const { formattedDate, formattedTime } = formatDateTime(new Date(event.startDate));

    const results = await Promise.all(
      emails.map(async (email: string) => {
        // Check if guest already exists
        const existingGuest = await Guest.findOne({
          eventId: params.eventId,
          email
        });

        if (existingGuest) {
          return {
            email,
            status: "already_invited"
          };
        }

        // Create new guest
        const guest = await Guest.create({
          eventId: params.eventId,
          email,
          status: "invited",
          role: data.role || "attendee",
          invitedBy: userId
        });

        // Send invitation email with properly formatted params
        if (plan.limits.features.includes(FEATURES.EMAIL_INVITES)) {
          await sendEventInvitation({
            recipientEmail: email,
            eventTitle: event.title,
            eventDate: formattedDate,
            eventTime: formattedTime,
            location: `${event.location.venue}, ${event.location.address}`,
            eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
            personalMessage: data.message
          });
        }

        // Create activity
        await createActivity({
          type: "guest.invited",
          userId,
          eventId: params.eventId,
          metadata: { 
            guestEmail: email,
            subscriptionTier: subscription.plan 
          }
        });

        return {
          email,
          status: "invited",
          guestId: guest._id
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error inviting guests:", error);
    if (error instanceof ApiError) {
      return new NextResponse(error.message, { status: error.statusCode });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}