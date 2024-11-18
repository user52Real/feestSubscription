// src/components/dashboard/upcoming-events.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-state";

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: {
    venue: string;
    address: string;
  };
  attendees: {
    confirmed: number;
    total: number;
  };
  status: "upcoming" | "ongoing" | "ended";
  visibility: "public" | "private";
}

interface ApiResponse {
  events: Event[];
  success: boolean;
  error?: string;
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch('/api/events/upcoming');
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming events');
        }
        const data: ApiResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch events');
        }

        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching upcoming events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      ended: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Upcoming Events</CardTitle>
        <Link href="/events">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No upcoming events
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Link 
                  key={event.id} 
                  href={`/events/${event.id}`}
                  className="block"
                >
                  <div className="rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(event.startDate), "PPP")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(new Date(event.startDate), "p")} - 
                        {format(new Date(event.endDate), "p")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location.venue}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {event.attendees.confirmed} / {event.attendees.total} attendees
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}