// src/components/dashboard/recent-activity.tsx
"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Calendar, 
  UserCheck, 
  UserMinus, 
  MessageSquare, 
  Edit,
  ExternalLink,
  Settings,
  Mail
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  userId: string;
  eventId: string;
  metadata?: {
    guestId?: string;
    guestName?: string;
    eventTitle?: string;
    changes?: string[];
    messageId?: string;
    messageContent?: string;
  };
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
    email: string;
  };
  event?: {
    title: string;
  };
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities?limit=20');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      
      // Fetch user details for each activity
      const enrichedActivities = await Promise.all(
        data.map(async (activity: Activity) => {
          try {
            const userResponse = await fetch(`/api/users/${activity.userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              return {
                ...activity,
                user: {
                  name: userData.name || 'Unknown User',
                  avatar: userData.imageUrl,
                  email: userData.emailAddress
                }
              };
            }
          } catch (error) {
            console.error(`Error fetching user data for ${activity.userId}:`, error);
          }
          return activity;
        })
      );

      setActivities(enrichedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      'event.created': <Calendar className="h-4 w-4" />,
      'event.updated': <Edit className="h-4 w-4" />,
      'event.cancelled': <UserMinus className="h-4 w-4" />,
      'guest.invited': <Mail className="h-4 w-4" />,
      'guest.confirmed': <UserCheck className="h-4 w-4" />,
      'guest.declined': <UserMinus className="h-4 w-4" />,
      'guest.checked_in': <UserCheck className="h-4 w-4" />,
      'guest.removed': <UserMinus className="h-4 w-4" />,
      'message.sent': <MessageSquare className="h-4 w-4" />,
      'settings.updated': <Settings className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <Calendar className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      'event.created': "bg-green-100 text-green-800",
      'event.updated': "bg-yellow-100 text-yellow-800",
      'event.cancelled': "bg-red-100 text-red-800",
      'guest.invited': "bg-blue-100 text-blue-800",
      'guest.confirmed': "bg-green-100 text-green-800",
      'guest.declined': "bg-red-100 text-red-800",
      'guest.checked_in': "bg-green-100 text-green-800",
      'guest.removed': "bg-red-100 text-red-800",
      'message.sent': "bg-purple-100 text-purple-800",
      'settings.updated': "bg-yellow-100 text-yellow-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'event.created':
        return `created event "${activity.metadata?.eventTitle}"`;
      case 'event.updated':
        return `updated event details (${activity.metadata?.changes?.join(', ')})`;
      case 'event.cancelled':
        return `cancelled event "${activity.metadata?.eventTitle}"`;
      case 'guest.invited':
        return `invited ${activity.metadata?.guestName} to the event`;
      case 'guest.confirmed':
        return `confirmed attendance for ${activity.metadata?.guestName}`;
      case 'guest.declined':
        return `declined attendance for ${activity.metadata?.guestName}`;
      case 'guest.checked_in':
        return `checked in ${activity.metadata?.guestName}`;
      case 'guest.removed':
        return `removed ${activity.metadata?.guestName} from the event`;
      case 'message.sent':
        return `sent a message: "${activity.metadata?.messageContent}"`;
      case 'settings.updated':
        return `updated event settings`;
      default:
        return 'performed an action';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex items-start space-x-4 animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 border-b pb-4 last:border-0"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar>
                    <AvatarImage 
                      src={activity.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activity.userId}`} 
                    />
                    <AvatarFallback>
                      {activity.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <div>{activity.user?.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground">
                    {activity.user?.email || activity.userId}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={getActivityColor(activity.type)}>
                  <span className="flex items-center gap-1">
                    {getActivityIcon(activity.type)}
                    {activity.type.split('.')[0]}
                  </span>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">{activity.user?.name || 'User'} </span>
                {formatActivityMessage(activity)}
              </div>
            </div>

            {activity.eventId && (
              <Link
                href={`/events/${activity.eventId}`}
                className="shrink-0 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}