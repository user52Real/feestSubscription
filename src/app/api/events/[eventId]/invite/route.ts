// src/app/api/events/[eventId]/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";
import { sendEventInvitation } from "@/lib/email/notifications";

interface InviteRequestBody {
  emails: string[];
  message?: string;
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

    const { emails, message } = await req.json() as InviteRequestBody;

    // Validate request body
    if (!Array.isArray(emails) || emails.length === 0) {
      return new NextResponse("Invalid email addresses", { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Get event details
    const event = await Event.findById(params.eventId);
    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if user is authorized to send invites
    if (event.organizerId !== userId && !event.coHosts.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create invitations and send emails
    const inviteResults = await Promise.allSettled(
      emails.map(async (email) => {
        try {
          // Check if guest already exists
          const existingGuest = await Guest.findOne({
            eventId: params.eventId,
            email: email.toLowerCase(),
          });

          if (existingGuest) {
            return {
              email,
              status: "already_invited",
            };
          }

          // Create new guest
          const guest = await Guest.create({
            eventId: params.eventId,
            email: email.toLowerCase(),
            status: "invited",
            role: "attendee",
            invitedBy: userId,
            invitedAt: new Date(),
          });

          // Format date and time for email
          const startDate = new Date(event.startDate);
          const formattedDate = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const formattedTime = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          // Send invitation email
          await sendEventInvitation({
            recipientEmail: email,
            eventTitle: event.title,
            eventDate: formattedDate,
            eventTime: formattedTime,
            location: `${event.location.venue}, ${event.location.address}`,
            eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
            personalMessage: message,
          });

          return {
            email,
            status: "invited",
            guestId: guest._id,
          };
        } catch (error) {
          console.error(`Error inviting ${email}:`, error);
          return {
            email,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // Process results
    const results = inviteResults.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          email: "unknown",
          status: "failed",
          error: result.reason?.message || "Failed to process invitation",
        };
      }
    });

    // Check if any invitations were successful
    const successfulInvites = results.filter(
      (result) => result.status === "invited"
    );

    if (successfulInvites.length === 0) {
      return new NextResponse(
        JSON.stringify({
          message: "No invitations were sent successfully",
          results,
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: `Successfully sent ${successfulInvites.length} invitation(s)`,
        results,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error sending invitations:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to send invitations",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

// a GET route to check invitation status
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const event = await Event.findById(params.eventId);
    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check authorization
    if (event.organizerId !== userId && !event.coHosts.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all invitations for this event
    const guests = await Guest.find({ eventId: params.eventId })
      .select('email status invitedAt role checkedIn')
      .sort('-invitedAt');

    return NextResponse.json(guests);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}