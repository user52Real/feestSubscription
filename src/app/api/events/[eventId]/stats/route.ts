import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";

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

    const [
      totalGuests,
      confirmedGuests,
      checkedInGuests,
      waitlistedGuests
    ] = await Promise.all([
      Guest.countDocuments({ eventId: params.eventId }),
      Guest.countDocuments({ eventId: params.eventId, status: "confirmed" }),
      Guest.countDocuments({ eventId: params.eventId, checkedIn: true }),
      Guest.countDocuments({ eventId: params.eventId, status: "waitlist" })
    ]);

    return NextResponse.json({
      total: totalGuests,
      confirmed: confirmedGuests,
      checkedIn: checkedInGuests,
      waitlisted: waitlistedGuests,
      capacity: event.capacity,
      fillRate: (confirmedGuests / event.capacity) * 100,
      checkInRate: (checkedInGuests / confirmedGuests) * 100
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}