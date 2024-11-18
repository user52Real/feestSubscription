"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  UserCheck,
  Search,
  UserX 
} from "lucide-react";

interface CheckInProps {
  eventId: string;
  onCheckedIn?: () => void;
}

export function CheckIn({ eventId, onCheckedIn }: CheckInProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();
  const checkInUrl = `${window.location.origin}/events/${eventId}/check-in`;

  const handleCheckIn = async (guestId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guestId }),
      });

      if (!response.ok) throw new Error("Check-in failed");

      const data = await response.json();
      toast({
        title: "Checked In Successfully",
        description: `${data.guest.name} has been checked in.`,
      });

      if (onCheckedIn) onCheckedIn();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Check-in Failed",
        description: "Unable to check in guest. Please try again.",
      });
    }
  };

  const searchGuests = async () => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/guests/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Search failed");
      return await response.json();
    } catch (error) {
      console.error("Error searching guests:", error);
      return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button onClick={searchGuests}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Show QR Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Event Check-in QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-4">
              <QRCodeSVG value={checkInUrl} size={256} />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan this QR code to check in to the event
            </p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Guest search results and check-in UI would go here */}
    </div>
  );
}