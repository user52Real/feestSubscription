// src/app/(dashboard)/dashboard/page.tsx
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

async function getEventStats(userId: string) {
  await dbConnect();

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  try {
    const [
      totalEvents,
      upcomingEvents,
      totalAttendees,
      checkedInAttendees
    ] = await Promise.all([
      // Total events
      Event.countDocuments({ organizerId: userId }),
      
      // Upcoming events (next 30 days)
      Event.countDocuments({
        organizerId: userId,
        startDate: { $gte: now, $lte: thirtyDaysFromNow }
      }),
      
      // Total confirmed attendees across all events
      Guest.countDocuments({
        eventId: { 
          $in: (await Event.find({ organizerId: userId }).select('_id'))
            .map(event => event._id)
        },
        status: "confirmed"
      }),
      
      // Total checked-in attendees
      Guest.countDocuments({
        eventId: { 
          $in: (await Event.find({ organizerId: userId }).select('_id'))
            .map(event => event._id)
        },
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

  const stats = await getEventStats(userId);

  return (
    <div className="flex gap-4">
      {/* Left Sidebar for Ad */}
      {/* <div className="hidden xl:block w-[100px] shrink-0">
        <AdUnit 
          slot="30002"
          format="vertical"
          style={{ 
            position: "sticky",
            top: "2rem",
            minHeight: "600px",
            width: "160px",
            margin: "",
            display: "flex"
          }}
        />
      </div> */}

      {/* Main Dashboard Content */}
      <div className="flex-1 space-y-8 p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EventStats stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8">
          {/* Upcoming Events Section */}
          <div className="w-full">
            <UpcomingEvents />
          </div>

          {/* Analytics Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Analytics */}
            <FeatureGate feature={FEATURES.BASIC_ANALYTICS}>
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
              {/* Basic Charts */}
              <div className="w-full">
                <DashboardCharts />
              </div>

              {/* Advanced Analytics */}
              <FeatureGate 
                feature={FEATURES.ADVANCED_ANALYTICS}
                fallback={
                  <Card className="p-8 text-center">
                    <h3 className="font-semibold">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upgrade to access detailed analytics and insights
                    </p>
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