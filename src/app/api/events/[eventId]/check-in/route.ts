import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Guest } from "@/lib/db/models/guest";
import { createActivity } from "@/lib/activity/notifications";

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
    const { guestId } = await req.json();

    const guest = await Guest.findOne({
      _id: guestId,
      eventId: params.eventId
    });

    if (!guest) {
      return new NextResponse("Guest not found", { status: 404 });
    }

    if (guest.checkedIn) {
      return new NextResponse("Guest already checked in", { status: 400 });
    }

  

    guest.checkedIn = true;
    guest.checkedInAt = new Date();
    await guest.save();

    // Create activity log
    await createActivity({
      type: "guest.checked_in",
      userId,
      eventId: params.eventId,
      metadata: {
        guestId: guest._id,
        guestName: guest.name
      }
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("Error checking in guest:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}