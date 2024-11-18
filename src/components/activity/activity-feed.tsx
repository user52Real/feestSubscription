"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { pusherClient } from "@/lib/pusher";
import { Activity, formatActivityMessage } from "@/lib/activity/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityFeedProps {
  eventId?: string;
  userId?: string;
  limit?: number;
}

export function ActivityFeed({ eventId, userId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        let response;
        if (eventId) {
          response = await fetch(`/api/events/${eventId}/activities?limit=${limit}`);
        } else if (userId) {
          response = await fetch(`/api/users/${userId}/activities?limit=${limit}`);
        }

        if (response?.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [eventId, userId, limit]);

  useEffect(() => {
    if (!eventId && !userId) return;

    const channel = pusherClient.subscribe(
      eventId ? `event-${eventId}` : `user-${userId}`
    );

    channel.bind("new-activity", (data: Activity) => {
      setActivities((prev) => [data, ...prev].slice(0, limit));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [eventId, userId, limit]);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-4">
        {activities.map((activity) => (
          <div
            key={activity.createdAt.toString()}
            className="flex items-start space-x-4"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${activity.userId}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>User ID: {activity.userId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">User </span>
                {formatActivityMessage(activity)}
              </p>
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {JSON.stringify(activity.metadata)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}