import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Waitlist } from "@/lib/db/models/waitlist";
import { Guest } from "@/lib/db/models/guest";
import { ActivityTypes, createActivity } from "@/lib/activity/notifications";

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
      const event = await Event.findById(params.eventId);
  
      if (!event) {
        return new NextResponse("Event not found", { status: 404 });
      }
  
      // Check if waitlist is enabled
      if (!event.waitlist.enabled) {
        return new NextResponse("Waitlist not enabled for this event", { 
          status: 400 
        });
      }
  
      // Check if user is already registered or on waitlist
      const [existingGuest, existingWaitlist] = await Promise.all([
        Guest.findOne({ eventId: params.eventId, userId }),
        Waitlist.findOne({ eventId: params.eventId, userId })
      ]);
  
      if (existingGuest) {
        return new NextResponse("Already registered for event", { 
          status: 400 
        });
      }
  
      if (existingWaitlist) {
        return new NextResponse("Already on waitlist", { status: 400 });
      }
  
      // Get current waitlist position
      const lastPosition = await Waitlist.findOne({ 
        eventId: params.eventId 
      })
      .sort({ position: -1 })
      .select('position');
  
      const newPosition = lastPosition ? lastPosition.position + 1 : 1;
  
      // Check if waitlist is full
      if (event.waitlist.maxSize && newPosition > event.waitlist.maxSize) {
        return new NextResponse("Waitlist is full", { status: 400 });
      }
  
      // Add to waitlist
      const waitlistEntry = await Waitlist.create({
        eventId: params.eventId,
        userId,
        position: newPosition
      });
  
      // Create activity log with correct activity type
      await createActivity({
        type: ActivityTypes.GUEST_WAITLISTED,
        userId,
        eventId: params.eventId,
        metadata: { position: newPosition }
      });
  
      return NextResponse.json(waitlistEntry);
    } catch (error) {
      console.error("Error joining waitlist:", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
}

// Get waitlist status
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
    const waitlistEntry = await Waitlist.findOne({
      eventId: params.eventId,
      userId
    });

    return NextResponse.json(waitlistEntry || null);
  } catch (error) {
    console.error("Error getting waitlist status:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}