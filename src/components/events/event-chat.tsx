"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { pusherClient } from "@/lib/pusher";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: string;
}

export function EventChat({ eventId }: { eventId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    fetchMessages();
    const channel = pusherClient.subscribe(`event-${eventId}`);
    
    channel.bind("new-message", (message: Message) => {
      setMessages((current) => [...current, message]);
      scrollToBottom();
    });

    return () => {
      pusherClient.unbind_all();
      pusherClient.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/chat`);
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await fetch(`/api/events/${eventId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          senderName: user?.fullName,
          senderAvatar: user?.imageUrl,
        }),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.senderId === user?.id ? "justify-end" : ""
              }`}
            >
              {message.senderId !== user?.id && (
                <Avatar>
                  <AvatarImage src={message.senderAvatar} />
                  <AvatarFallback>
                    {message.senderName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`flex flex-col space-y-1 ${
                  message.senderId === user?.id ? "items-end" : ""
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.senderId === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.createdAt), "p")}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}