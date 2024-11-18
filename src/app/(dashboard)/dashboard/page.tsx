import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/charts";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { EventStats } from "@/components/dashboard/event-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import dbConnect from "@/lib/db/connection";
import { Event } from "@/lib/db/models/event";
import { Guest } from "@/lib/db/models/guest";
import AdUnit from "@/components/ads/AdUnit";
import { FeatureGate } from "@/components/subscription/feature-gate";
import { FEATURES } from "@/types/subscription";
import { getCurrentSubscription } from "@/lib/subscription/subscription-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getEventStats(userId: string) {
  await dbConnect();

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  try {
    // Get user's events first to avoid multiple queries
    const userEvents = await Event.find({ organizerId: userId }).select('_id');
    const eventIds = userEvents.map(event => event._id);

    const [totalEvents, upcomingEvents, totalAttendees, checkedInAttendees] = await Promise.all([
      // Total events (use cached result)
      Promise.resolve(userEvents.length),
      
      // Upcoming events (next 30 days)
      Event.countDocuments({
        _id: { $in: eventIds },
        startDate: { $gte: now, $lte: thirtyDaysFromNow }
      }),
      
      // Total confirmed attendees across all events
      Guest.countDocuments({
        eventId: { $in: eventIds },
        status: "confirmed"
      }),
      
      // Total checked-in attendees
      Guest.countDocuments({
        eventId: { $in: eventIds },
        checkedIn: true
      })
    ]);

    const averageAttendance = totalAttendees > 0 
      ? Math.round((checkedInAttendees / totalAttendees) * 100)
      : 0;

    return {
      totalEvents,
      upcomingEvents,
      totalAttendees,
      averageAttendance
    };
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return {
      totalEvents: 0,
      upcomingEvents: 0,
      totalAttendees: 0,
      averageAttendance: 0
    };
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [stats, subscription] = await Promise.all([
    getEventStats(userId),
    getCurrentSubscription(userId)
  ]);

  const hasReachedEventLimit = subscription.usage.eventsCreated >= subscription.limits.maxEvents;

  return (
    <div className="flex gap-4">
      {/* Main Dashboard Content */}
      <div className="flex-1 space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {hasReachedEventLimit ? (
            <Button asChild variant="outline">
              <Link href="/settings/subscription">
                Upgrade Plan
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/events/new">Create Event</Link>
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EventStats 
            stats={stats} 
            limits={{
              maxEvents: subscription.limits.maxEvents,
              maxGuests: subscription.limits.maxGuestsPerEvent
            }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8">
          {/* Upcoming Events Section */}
          <div className="w-full">
            <UpcomingEvents maxEvents={subscription.limits.maxEvents} />
          </div>

          {/* Analytics Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Analytics */}
            <FeatureGate 
              feature={FEATURES.BASIC_ANALYTICS}
              fallback={
                <Card className="p-8 text-center">
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upgrade to view event analytics
                  </p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/settings/subscription">Upgrade Now</Link>
                  </Button>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </FeatureGate>

            {/* Charts Section */}
            <div className="space-y-6">
              {/* Advanced Analytics */}
              <FeatureGate 
                feature={FEATURES.ADVANCED_ANALYTICS}
                fallback={
                  <Card className="p-8 text-center">
                    <h3 className="font-semibold">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upgrade to access detailed analytics and insights
                    </p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link href="/settings/subscription">Upgrade Now</Link>
                    </Button>
                  </Card>
                }
              >
                <DashboardCharts />
              </FeatureGate>
            </div>
          </div>
        </div>

        {/* Advertisement Section */}
        <div className="hidden xl:block">
          <AdUnit 
            slot="30002"
            format="vertical"
            style={{ 
              position: "sticky",
              top: "2rem",
              minHeight: "100px",
              maxWidth: "400px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "center"
            }}
          />
        </div>
      </div>      
    </div>
  );
}