import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/events/event-form";
import { Event } from "@/lib/db/models/event";
import dbConnect from "@/lib/db/connection";

async function getEvent(eventId: string) {
  try {
    await dbConnect();
    const event = await Event.findById(eventId).toString();
    if (!event) return null;
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default async function EditEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const event = await getEvent(params.eventId);
  if (!event) {
    redirect("/events");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">
          Update your event details below.
        </p>
      </div>

      <Card className="p-6">
        <EventForm event={event} isEditing />
      </Card>
    </div>
  );
}