import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Message } from "@/lib/db/models/message";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";

// GET a single message
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Check if user has access to the event
    const guest = await Guest.findOne({
      eventId: params.eventId,
      userId,
      status: { $in: ["confirmed", "checked_in"] }
    });

    if (!guest) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const message = await Message.findById(params.messageId)
      .populate('senderId', 'name avatar')
      .lean();

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH update a message
export async function PATCH(
  req: NextRequest,
  { params }: { params: { eventId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const message = await Message.findById(params.messageId);
    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Check if user is the message sender
    if (message.senderId.toString() !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const updatedMessage = await Message.findByIdAndUpdate(
      params.messageId,
      {
        $set: {
          content: data.content,
          edited: true,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('senderId', 'name avatar');

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Check if user has permission to delete the message
    const [message, event] = await Promise.all([
      Message.findById(params.messageId),
      Event.findById(params.eventId)
    ]);

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Allow deletion if user is:
    // 1. The message sender
    // 2. The event organizer
    // 3. A co-host of the event
    const isMessageSender = message.senderId.toString() === userId;
    const isOrganizer = event?.organizerId === userId;
    const isCoHost = event?.coHosts?.includes(userId);

    if (!isMessageSender && !isOrganizer && !isCoHost) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await Message.findByIdAndDelete(params.messageId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}