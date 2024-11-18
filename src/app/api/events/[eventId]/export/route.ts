import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";
import { createObjectCsvStringifier } from "csv-writer";

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

    if (event.organizerId !== userId && !event.coHosts.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const guests = await Guest.find({ eventId: params.eventId });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'status', title: 'Status' },
        { id: 'checkedIn', title: 'Checked In' },
        { id: 'checkedInAt', title: 'Check-in Time' },
        { id: 'dietaryPreferences', title: 'Dietary Preferences' }
      ]
    });

    const records = guests.map(guest => ({
      name: guest.name,
      email: guest.email,
      status: guest.status,
      checkedIn: guest.checkedIn ? 'Yes' : 'No',
      checkedInAt: guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleString() : '',
      dietaryPreferences: guest.dietaryPreferences?.join(', ') || ''
    }));

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="event-${event.title}-guests.csv"`
      }
    });
  } catch (error) {
    console.error("Error exporting event data:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}