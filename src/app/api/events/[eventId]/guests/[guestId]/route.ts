// src/app/api/events/[eventId]/guests/[guestId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";  // Add this import
import { Guest } from "@/lib/db/models/guest";
import { ActivityTypes, createActivity } from "@/lib/activity/notifications";

// Type for the update request body
interface UpdateGuestRequest {
  status?: "confirmed" | "declined" | "waitlist" | "invited";
  role?: "attendee" | "coHost" | "moderator";
  checkedIn?: boolean;
  dietaryPreferences?: string[];
  notes?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { eventId: string; guestId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const data = await req.json() as UpdateGuestRequest;

    // Validate the update data
    const allowedFields = [
      "status",
      "role",
      "checkedIn",
      "dietaryPreferences",
      "notes"
    ];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );

    // Find guest
    const guest = await Guest.findById(params.guestId);
    if (!guest) {
      return new NextResponse("Guest not found", { status: 404 });
    }

    // Find event
    const event = await Event.findById(params.eventId);
    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check permissions
    const canUpdate = 
      event.organizerId === userId || 
      event.coHosts.includes(userId) || 
      guest.userId === userId;

    if (!canUpdate) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update guest with validation
    const updatedGuest = await Guest.findByIdAndUpdate(
      params.guestId,
      { 
        ...updateData,
        ...(updateData.checkedIn && { checkedInAt: new Date() })
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    // Create activity log
    await createActivity({
      type: ActivityTypes.GUEST_UPDATED,
      userId,
      eventId: params.eventId,
      metadata: {
        guestId: params.guestId,
        updates: Object.keys(updateData).join(", ")
      }
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("Error updating guest:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; guestId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Find event and check permissions
    const event = await Event.findById(params.eventId);
    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Only organizers and co-hosts can remove guests
    if (event.organizerId !== userId && !event.coHosts.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find and delete guest
    const guest = await Guest.findById(params.guestId);
    if (!guest) {
      return new NextResponse("Guest not found", { status: 404 });
    }

    await Guest.findByIdAndDelete(params.guestId);

    // Create activity log
    await createActivity({
      type: ActivityTypes.GUEST_REMOVED,
      userId,
      eventId: params.eventId,
      metadata: { 
        guestId: params.guestId,
        guestEmail: guest.email // Include email for reference
      }
    });

    // Return success with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing guest:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}