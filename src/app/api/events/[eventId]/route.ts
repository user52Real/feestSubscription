import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await dbConnect();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.eventId)) {
      return new NextResponse("Invalid event ID", { status: 400 });
    }

    const event = await Event.findById(params.eventId);

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Convert Mongoose document to a plain JavaScript object
    const eventObject = event;

    // Create a serializable version of the event
    const serializedEvent = {
      id: eventObject._id.toString(),
      title: eventObject.title,
      description: eventObject.description,
      startDate: eventObject.startDate.toISOString(),
      endDate: eventObject.endDate.toISOString(),
      location: {
        venue: eventObject.location?.venue || '',
        address: eventObject.location?.address || '',
        coordinates: eventObject.location?.coordinates || null,
      },
      capacity: eventObject.capacity,
      status: eventObject.status,
      visibility: eventObject.visibility,
      organizerId: eventObject.organizerId,
      coHosts: eventObject.coHosts || [],
      recurring: eventObject.recurring || null,
      createdAt: eventObject.createdAt.toISOString(),
      updatedAt: eventObject.updatedAt.toISOString(),
      attendees: {
        confirmed: 0, // You'll need to fetch these counts separately
        waitlist: 0,
      },
    };

    return NextResponse.json(serializedEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
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

    if (event.organizerId !== userId && !event.coHosts.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      params.eventId,
      { ...data },
      { new: true }
    );

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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

    if (event.organizerId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await Event.findByIdAndDelete(params.eventId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}