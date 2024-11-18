// src/app/(dashboard)/events/new/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create your event.
        </p>
      </div>

      <Card className="p-6">
        <EventForm />
      </Card>
    </div>
  );
}