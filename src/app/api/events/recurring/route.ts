import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addDays, addWeeks, addMonths, setDate } from "date-fns";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // Create base event
    const baseEvent = await Event.create({
      ...data,
      organizerId: userId
    });

    // Generate recurring instances if recurring is enabled
    if (data.recurring && data.recurring.pattern) {
      const instances = generateRecurringInstances(baseEvent);
      await Event.insertMany(instances);
    }

    return NextResponse.json(baseEvent);
  } catch (error) {
    console.error("Error creating recurring event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

function generateRecurringInstances(baseEvent: any) {
  const instances = [];
  const { pattern, interval, endDate, daysOfWeek, dayOfMonth } = baseEvent.recurring;
  let currentDate = new Date(baseEvent.startDate);
  const duration = baseEvent.endDate.getTime() - baseEvent.startDate.getTime();

  while (currentDate <= new Date(endDate)) {
    // Skip the base event date
    if (currentDate.getTime() === baseEvent.startDate.getTime()) {
      currentDate = getNextDate(currentDate, pattern, interval);
      continue;
    }

    // Skip if date is in exceptions
    if (baseEvent.recurring.exceptions?.some((d: Date) => 
      d.getTime() === currentDate.getTime()
    )) {
      currentDate = getNextDate(currentDate, pattern, interval);
      continue;
    }

    // For weekly pattern, check if day is included
    if (pattern === "weekly" && daysOfWeek) {
      const dayOfWeek = currentDate.getDay();
      if (!daysOfWeek.includes(dayOfWeek)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }
    }

    // For monthly pattern, check if it's the right day
    if (pattern === "monthly" && dayOfMonth) {
      if (currentDate.getDate() !== dayOfMonth) {
        currentDate = setDate(currentDate, dayOfMonth);
        continue;
      }
    }

    const instanceEndDate = new Date(currentDate.getTime() + duration);

    instances.push({
      ...baseEvent.toObject(),
      _id: undefined,
      startDate: currentDate,
      endDate: instanceEndDate,
      recurring: {
        ...baseEvent.recurring,
        originalEventId: baseEvent._id
      }
    });

    currentDate = getNextDate(currentDate, pattern, interval);
  }

  return instances;
}

function getNextDate(date: Date, pattern: string, interval: number): Date {
  switch (pattern) {
    case "daily":
      return addDays(date, interval);
    case "weekly":
      return addWeeks(date, interval);
    case "monthly":
      return addMonths(date, interval);
    default:
      return date;
  }
}