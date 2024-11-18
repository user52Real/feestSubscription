"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { pusherClient } from "@/lib/pusher";

interface Guest {
  id: string;
  name: string;
  email: string;
  status: "invited" | "confirmed" | "declined" | "waitlist";
  role: "attendee" | "coHost" | "moderator";
  checkedIn: boolean;
  checkedInAt?: string;
}

export function GuestList({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuests();

    // Initialize Pusher only if we have the required credentials
    if (process.env.NEXT_PUBLIC_PUSHER_APP_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      try {
        const channel = pusherClient.subscribe(`event-${eventId}`);
        
        channel.bind("guest-updated", (updatedGuest: Guest) => {
          setGuests(currentGuests =>
            currentGuests.map(guest =>
              guest.id === updatedGuest.id ? updatedGuest : guest
            )
          );
        });

        channel.bind("guest-added", (newGuest: Guest) => {
          setGuests(currentGuests => [...currentGuests, newGuest]);
        });

        channel.bind("guest-removed", (removedGuestId: string) => {
          setGuests(currentGuests =>
            currentGuests.filter(guest => guest.id !== removedGuestId)
          );
        });

        return () => {
          channel.unbind_all();
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Pusher initialization error:", error);
      }
    }
  }, [eventId]);

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests`);
      if (!response.ok) throw new Error("Failed to fetch guests");
      const data = await response.json();
      setGuests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load guest list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGuestStatus = async (guestId: string, status: Guest["status"]) => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests/${guestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update guest status");

      toast({
        title: "Success",
        description: "Guest status updated",
      });

      fetchGuests(); // Refresh the guest list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update guest status",
        variant: "destructive",
      });
    }
  };

  const removeGuest = async (guestId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests/${guestId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove guest");

      toast({
        title: "Success",
        description: "Guest removed successfully",
      });

      fetchGuests(); // Refresh the guest list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove guest",
        variant: "destructive",
      });
    }
  };

  const filteredGuests = guests.filter(
    guest =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Guest["status"]) => {
    const colors = {
      invited: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      waitlist: "bg-yellow-100 text-yellow-800",
    };
    return colors[status];
  };

  if (loading) {
    return <div>Loading guest list...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search guests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between rounded-lg border p-2"
            >
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${guest.email}`} />
                  <AvatarFallback>{guest.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{guest.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {guest.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(guest.status)}>
                  {guest.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateGuestStatus(guest.id, "confirmed")}
                    >
                      Confirm
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateGuestStatus(guest.id, "declined")}
                    >
                      Decline
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateGuestStatus(guest.id, "waitlist")}
                    >
                      Move to Waitlist
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => removeGuest(guest.id)}
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}