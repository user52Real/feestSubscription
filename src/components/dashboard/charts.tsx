"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from './metric-card';
import { Calendar } from "../ui/calendar";
import { Activity } from "@/lib/db/models/activity";
import { useQuery } from "@tanstack/react-query";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface ChartData {
  attendanceData: {
    name: string;
    attendees: number;
    capacity: number;
  }[];
  registrationData: {
    name: string;
    registrations: number;
  }[];
  eventTypeData: {
    name: string;
    value: number;
  }[];
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/events/stats/charts');
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        const chartData = await response.json();
        setData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Failed to load chart data
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="types">Event Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="attendees" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Attendees"
                />
                <Line 
                  type="monotone" 
                  dataKey="capacity" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Capacity"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="registrations" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.registrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="registrations" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                  name="Registrations"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="types" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.eventTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// export default function DashboardMetrics() {
//   const metrics = useQuery(['metrics'], async () => {
//     const response = await fetch('/api/events/stats');
//     return response.json();
//   });

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//       <MetricCard
//         title="Total Events"
//         value={metrics.data.totalEvents}
//         icon={<Calendar />}
//       />
//       <MetricCard
//         title="Active Events"
//         value={metrics.data.activeEvents}
//         icon={<Activity />}
//       />
//       {/* Add more metric cards */}
//     </div>
//   );
// }


