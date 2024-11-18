import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Message } from "@/lib/db/models/message";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";
import { pusherServer } from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const before = searchParams.get("before");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query: any = { eventId: params.eventId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'name avatar');

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
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

    // Check if user is part of the event
    const guest = await Guest.findOne({
      eventId: params.eventId,
      userId,
      status: { $in: ["confirmed", "checked_in"] }
    });

    if (!guest) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const message = await Message.create({
      ...data,
      eventId: params.eventId,
      senderId: userId
    });

    // Broadcast message via Pusher
    await pusherServer.trigger(
      `event-${params.eventId}`,
      "new-message",
      {
        ...message.toJSON(),
        sender: {
          id: userId,
          name: data.senderName,
          avatar: data.senderAvatar
        }
      }
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}