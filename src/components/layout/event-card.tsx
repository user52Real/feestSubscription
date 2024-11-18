import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Calendar, Clock, MapPin, Users } from "lucide-react";
  import { format } from "date-fns";
  
  interface EventCardProps {
    event: {
      title: string;
      description: string;
      startDate: Date;
      endDate: Date;
      location: {
        venue: string;
      };
      capacity: number;
      status: string;
    };
  }
  
  export function EventCard({ event }: EventCardProps) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <Badge variant={event.status === "published" ? "default" : "secondary"}>
              {event.status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.startDate), "PPP")}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.startDate), "p")}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{event.location.venue}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4" />
            <span>{event.capacity} attendees</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Edit</Button>
          <Button>View Details</Button>
        </CardFooter>
      </Card>
    );
  }