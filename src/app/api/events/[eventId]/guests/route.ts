// src/app/api/events/[eventId]/guests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";
import { sendEventInvitation } from "@/lib/email/notifications";
import { createActivity } from "@/lib/activity/notifications";
import { formatDateTime } from "@/lib/email/notifications";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const event = await Event.findById(params.eventId);

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if user has permission to invite
    if (event.organizerId !== userId && !event.coHosts.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Format event date and time
    const { formattedDate, formattedTime } = formatDateTime(new Date(event.startDate));

    // Handle batch invitations
    const emails = Array.isArray(data.email) ? data.email : [data.email];
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
        await sendEventInvitation({
          recipientEmail: email,
          eventTitle: event.title,
          eventDate: formattedDate,
          eventTime: formattedTime,
          location: `${event.location.venue}, ${event.location.address}`,
          eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
          personalMessage: data.message
        });

        // Create activity
        await createActivity({
          type: "guest.invited",
          userId,
          eventId: params.eventId,
          metadata: { guestEmail: email }
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}