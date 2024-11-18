import { notFound } from "next/navigation";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Share2, 
  Download, 
  Mail, 
  MessageCircle,
  Settings,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "react-error-boundary";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GuestList } from "@/components/events/guest-list";
import { EventChat } from "@/components/events/event-chat";
import { ShareEvent } from "@/components/events/share-event";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connection";
import { Event as EventModel } from "@/lib/db/models/event";
import { serializeEvent } from "@/lib/utils";
import AdUnit from "@/components/ads/AdUnit";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <p className="text-muted-foreground">Something went wrong</p>
      <pre className="text-sm text-red-500">{error.message}</pre>
    </div>
  );
}

async function getEvent(eventId: string) {
  try {
    await dbConnect();
    const event = await EventModel.findById(eventId).lean();
    if (!event) return null;
    return serializeEvent(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { userId } = await auth();
  const event = await getEvent(params.eventId);

  if (!event) {
    notFound();
  }

  const isOrganizer = userId === event.organizerId;
  const isCoHost = event.coHosts.includes(userId!);
  const canManageEvent = isOrganizer || isCoHost;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <Badge variant={event.status === "published" ? "default" : "secondary"}>
              {event.status}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{event.description}</p>
        </div>
        
        {canManageEvent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Event Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" /> Send Reminders
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <AlertCircle className="mr-2 h-4 w-4" /> Cancel Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Event Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Event Details</h2>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Event</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download iCal</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), "PPP")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), "p")} - {format(new Date(event.endDate), "p")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location.venue}<br />
                    {event.location.address}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {event.attendees?.confirmed || 0} confirmed / {event.capacity} maximum
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Guest List */}
        <Card className="p-6 h-full">
          <h2 className="text-xl font-semibold mb-4">Guest List</h2>
          <Separator className="mb-4" />
          <GuestList eventId={event.id} />
        </Card>
      </div>

      {/* Chat Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Event Discussion</h2>
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat Settings
          </Button>
        </div>
        <Separator className="mb-4" />
        <EventChat eventId={event.id} />
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
      </Card>

      {/* Share Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="fixed bottom-4 right-4">
            <Share2 className="h-4 w-4 mr-2" />
            Share Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
            <DialogDescription>
              Share this event with your network
            </DialogDescription>
          </DialogHeader>
          <ShareEvent event={event} />
        </DialogContent>
      </Dialog>
    </div>
  );
}