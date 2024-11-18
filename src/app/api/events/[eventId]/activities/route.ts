// src/app/api/events/[eventId]/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Activity } from "@/lib/db/models/activity";

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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const before = searchParams.get("before");

    let query: any = { eventId: params.eventId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const activities = await Activity
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name avatar');

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}