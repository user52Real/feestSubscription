// src/components/dashboard/metrics.tsx
import { useQuery } from '@tanstack/react-query';
import { Calendar, Activity, Users, TrendingUp } from 'lucide-react';
import { MetricCard } from './metric-card';

interface MetricsData {
  totalEvents: number;
  activeEvents: number;
  totalAttendees: number;
  growthRate: number;
}

export function DashboardMetrics() {
  const { data, isLoading } = useQuery<MetricsData>({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await fetch('/api/events/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Events"
        value={data?.totalEvents || 0}
        icon={<Calendar className="h-4 w-4" />}
        description="All time events"
      />
      <MetricCard
        title="Active Events"
        value={data?.activeEvents || 0}
        icon={<Activity className="h-4 w-4" />}
        description="Currently running"
      />
      <MetricCard
        title="Total Attendees"
        value={data?.totalAttendees || 0}
        icon={<Users className="h-4 w-4" />}
        description="Across all events"
      />
      <MetricCard
        title="Growth Rate"
        value={`${data?.growthRate || 0}%`}
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{
          value: data?.growthRate || 0,
          isPositive: (data?.growthRate || 0) > 0
        }}
        description="vs last month"
      />
    </div>
  );
}