import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";
import { startOfMonth, subMonths, format, startOfWeek, endOfWeek, subWeeks } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const now = new Date();

    // Get last 6 months of attendance data
    const monthlyAttendance = await Promise.all(
      Array.from({ length: 6 }).map(async (_, index) => {
        const monthStart = startOfMonth(subMonths(now, 5 - index));
        const monthName = format(monthStart, 'MMM');

        const monthEvents = await Event.find({
          organizerId: userId,
          startDate: {
            $gte: monthStart,
            $lt: startOfMonth(subMonths(now, 4 - index))
          }
        });

        const eventIds = monthEvents.map(event => event._id);
        const totalCapacity = monthEvents.reduce((sum, event) => sum + event.capacity, 0);
        
        const attendees = await Guest.countDocuments({
          eventId: { $in: eventIds },
          status: "checked_in"
        });

        return {
          name: monthName,
          attendees,
          capacity: totalCapacity || 0
        };
      })
    );

    // Get last 4 weeks of registration data
    const weeklyRegistrations = await Promise.all(
      Array.from({ length: 4 }).map(async (_, index) => {
        const weekStart = startOfWeek(subWeeks(now, 3 - index));
        const weekEnd = endOfWeek(subWeeks(now, 3 - index));

        const registrations = await Guest.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
          eventId: {
            $in: await Event.find({ organizerId: userId }).distinct('_id')
          }
        });

        return {
          name: `Week ${index + 1}`,
          registrations
        };
      })
    );

    // Get event types distribution
    const events = await Event.find({ organizerId: userId });
    const eventTypes = events.reduce((acc: { [key: string]: number }, event) => {
      const type = event.type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const eventTypeData = Object.entries(eventTypes).map(([name, value]) => ({
      name,
      value
    }));

    return NextResponse.json({
      attendanceData: monthlyAttendance,
      registrationData: weeklyRegistrations,
      eventTypeData
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}