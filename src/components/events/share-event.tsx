"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Link as LinkIcon,
  Check,
  Copy,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface ShareEventProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    location: {
      venue: string;
      address: string;
    };
  };
}

export function ShareEvent({ event }: ShareEventProps) {
  const [copied, setCopied] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const { toast } = useToast();
  const eventUrl = `${window.location.origin}/events/${event.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast({
        description: "Link copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        variant: "destructive",
        description: "Failed to copy link",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(event.title);
    const body = encodeURIComponent(
      `Check out this event: ${event.title}\n\n${event.description}\n\nDate: ${new Date(event.startDate).toLocaleDateString()}\nLocation: ${event.location.venue}, ${event.location.address}\n\nView event details: ${eventUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareToSocialMedia = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = encodeURIComponent(`Check out this event: ${event.title}`);
    const url = encodeURIComponent(eventUrl);
    
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };

    window.open(links[platform], '_blank', 'width=600,height=400');
  };

  const sendInvites = async () => {
    const emails = inviteEmails.split(',').map(email => email.trim()).filter(Boolean);
    
    if (emails.length === 0) {
      toast({
        variant: "destructive",
        description: "Please enter at least one email address",
      });
      return;
    }

    try {
      const response = await fetch(`/api/events/${event.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          message: inviteMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send invites');

      toast({
        description: "Invitations sent successfully",
      });
      
      // Clear the form
      setInviteEmails("");
      setInviteMessage("");
    } catch (error) {
      console.error('Error sending invites:', error);
      toast({
        variant: "destructive",
        description: "Failed to send invitations",
      });
    }
  };

  return (
    <Tabs defaultValue="share" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="share">Share</TabsTrigger>
        <TabsTrigger value="invite">Invite</TabsTrigger>
      </TabsList>

      <TabsContent value="share" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Share Link</CardTitle>
            <CardDescription>
              Copy the event link or share directly to social media
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={eventUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 mx-1"
                onClick={() => shareToSocialMedia('twitter')}
              >
                <Twitter className="h-5 w-5 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 mx-1"
                onClick={() => shareToSocialMedia('facebook')}
              >
                <Facebook className="h-5 w-5 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 mx-1"
                onClick={() => shareToSocialMedia('linkedin')}
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 mx-1"
                onClick={shareViaEmail}
              >
                <Mail className="h-5 w-5 mr-2" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invite" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Invite People</CardTitle>
            <CardDescription>
              Send email invitations to your guests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email Addresses
              </label>
              <Input
                placeholder="Enter email addresses (comma-separated)"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple email addresses with commas
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Personal Message (Optional)
              </label>
              <Textarea
                placeholder="Add a personal message to your invitation"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="h-32"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={sendInvites}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}