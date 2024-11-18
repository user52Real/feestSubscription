import { EventCalendar } from "@/components/calendar/event-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <EventCalendar />
    </div>
  );
}