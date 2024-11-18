// src/app/api/events/upcoming/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Fetch upcoming events
    const events = await Event.find({
      organizerId: userId,
      startDate: { $gte: now, $lte: thirtyDaysFromNow },
      status: { $ne: "cancelled" }
    })
    .sort({ startDate: 1 })
    .limit(5)
    .lean();

    // Get attendees count for each event
    const eventsWithAttendees = await Promise.all(
      events.map(async (event) => {
        const confirmedCount = await Guest.countDocuments({
          eventId: event._id,
          status: "confirmed"
        });

        const status = event.startDate > now 
          ? "upcoming"
          : event.endDate < now 
          ? "ended" 
          : "ongoing";

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: {
            venue: event.location?.venue || 'No venue specified',
            address: event.location?.address || 'No address specified'
          },
          attendees: {
            confirmed: confirmedCount,
            total: event.capacity
          },
          status,
          visibility: event.visibility
        };
      })
    );

    return NextResponse.json({
      events: eventsWithAttendees,
      success: true
    });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch upcoming events",
        success: false,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}