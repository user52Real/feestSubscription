import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; 
import dbConnect from "@/lib/db/connection";
import { Activity } from "@/lib/db/models/activity";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const before = searchParams.get("before");
    const eventId = searchParams.get("eventId");
    const type = searchParams.get("type");

    // Build query
    let query: any = {};
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    if (eventId) {
      query.eventId = eventId;
    }
    if (type) {
      query.type = type;
    }

    // Fetch activities
    const activities = await Activity
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    // Fetch user details from Clerk
    const userIds = Array.from(new Set(activities.map(a => a.userId)));
    const userDetails = new Map<string, any>();

    // In a real app, you would batch fetch users from Clerk
    // This is a simplified version
    for (const id of userIds) {
      try {
        const user = await clerkClient.users.getUser(userId);
        userDetails.set(id, {
          name: `${user.firstName} ${user.lastName}`,
          email: user.emailAddresses[0]?.emailAddress,
          avatar: user.imageUrl,
        });
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
      }
    }

    // Enrich activities with user details
    const enrichedActivities = activities.map(activity => ({
      ...activity.toObject(),
      id: activity._id.toString(),
      user: userDetails.get(activity.userId) || null,
    }));

    return NextResponse.json(enrichedActivities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}