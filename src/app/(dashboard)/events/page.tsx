import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { FeatureGate } from "@/components/subscription/feature-gate";
import dbConnect from "@/lib/db/connection";
import { Event as EventModel } from "@/lib/db/models/event";
import AdUnit from "@/components/ads/AdUnit";
import { FEATURES } from "@/types/subscription";

// Define the Event interface
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: {
    venue: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  status: "draft" | "published" | "cancelled";
  visibility: "public" | "private";
  organizerId: string;
  coHosts: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the MongoDB document interface
interface EventDocument {
  _id: any;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: {
    venue: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  status: "draft" | "published" | "cancelled";
  visibility: "public" | "private";
  organizerId: string;
  coHosts: string[];
  createdAt: Date;
  updatedAt: Date;
}

async function getEvents(userId: string): Promise<Event[]> {
  try {
    await dbConnect();
    const events = await EventModel.find({ organizerId: userId })
      .sort({ createdAt: -1 })
      .lean() as EventDocument[];

    return events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: event.location,
      capacity: event.capacity,
      status: event.status,
      visibility: event.visibility,
      organizerId: event.organizerId,
      coHosts: event.coHosts,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt)
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const events = await getEvents(userId);

  return (
    <div className="space-y-6">      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <FeatureGate 
          feature={FEATURES.RECURRING_EVENTS}
          fallback={
            <Button asChild>
              <Link href="/settings/subscription">
                <Plus className="mr-2 h-4 w-4" />
                Upgrade to Create Events
              </Link>
            </Button>
          }
        >
          <Button asChild>
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </FeatureGate>
      </div>     

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-muted-foreground">No events found</p>
          <FeatureGate 
            feature={FEATURES.RECURRING_EVENTS}
            fallback={
              <Button asChild>
                <Link href="/settings/subscription">Upgrade to Create Events</Link>
              </Button>
            }
          >
            <Button asChild>
              <Link href="/events/new">Create your first event</Link>
            </Button>
          </FeatureGate>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}          
        </div>
      )}
      
      <div className="xl:block item-center justify-items-center justify-center shrink-0">
        <AdUnit 
          slot="30002"
          format="vertical"
          style={{ 
            position: "sticky",
            top: "2rem",
            minHeight: "100px",
            width: "400px",
            margin: "0 auto",
            display: "flex"
          }}
        />
      </div>      
    </div>
  );
}