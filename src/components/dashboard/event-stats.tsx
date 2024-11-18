"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarCheck2, Users, TrendingUp, Percent } from "lucide-react";

interface StatsProps {
  stats: {
    totalEvents: number;
    upcomingEvents: number;
    totalAttendees: number;
    averageAttendance: number;
  };
  limits: {
    maxEvents: number;
    maxGuests: number;
  };
}

export function EventStats({ stats, limits }: StatsProps) {
  const [error, setError] = useState<string | null>(null);

  const eventProgress = (stats.totalEvents / limits.maxEvents) * 100;
  const isNearEventLimit = stats.totalEvents >= limits.maxEvents * 0.8;
  const isAtEventLimit = stats.totalEvents >= limits.maxEvents;

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading stats: {error}
      </div>
    );
  }

  return (
    <>
      <Card className={isAtEventLimit ? "border-destructive" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Total Events
            </CardTitle>
            {limits.maxEvents !== -1 && (
              <div className="flex items-center space-x-2">
                <Progress value={eventProgress} className="w-20 h-2" />
                <span className="text-xs text-muted-foreground">
                  {stats.totalEvents}/{limits.maxEvents}
                </span>
              </div>
            )}
          </div>
          <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            {isNearEventLimit && !isAtEventLimit && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="ml-2">
                    Near Limit
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  You're approaching your event limit
                </TooltipContent>
              </Tooltip>
            )}
            {isAtEventLimit && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="destructive" className="ml-2">
                    Limit Reached
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Upgrade your plan to create more events
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {limits.maxEvents === -1 ? "Unlimited events" : "Events this month"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Events
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          <p className="text-xs text-muted-foreground">
            Next 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Total Attendees
            </CardTitle>
            {limits.maxGuests !== -1 && (
              <div className="text-xs text-muted-foreground">
                Max {limits.maxGuests} per event
              </div>
            )}
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAttendees}</div>
          <p className="text-xs text-muted-foreground">
            {limits.maxGuests === -1 ? "Unlimited guests" : "Confirmed attendees"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Attendance
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageAttendance}%
          </div>
          <p className="text-xs text-muted-foreground">
            Check-in rate
          </p>
        </CardContent>
      </Card>
    </>
  );
}