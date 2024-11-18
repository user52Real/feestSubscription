import * as z from "zod";
import { EVENT_CATEGORIES, EVENT_TAGS } from "@/lib/constants/event-categories";

export const eventFormSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10),
  startDate: z.date(),
  endDate: z.date(),
  registrationDeadline: z.date(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()),
  venue: z.string().min(2),
  address: z.string().min(5),
  isVirtual: z.boolean().default(false),
  virtualLink: z.string().url().optional().nullable(),
  isHybrid: z.boolean().default(false),
  capacity: z.string().transform(Number),
  visibility: z.enum(["public", "private"]),
  recurring: z.object({
    enabled: z.boolean().default(false),
    pattern: z.enum(["daily", "weekly", "monthly"]).optional().nullable(),
    interval: z.number().optional().nullable(),
    endDate: z.date().optional().nullable(),
    daysOfWeek: z.array(z.number()).optional().nullable(),
    dayOfMonth: z.number().optional().nullable(),
  }),
  waitlist: z.object({
    enabled: z.boolean().default(false),
    maxSize: z.number().min(0).default(0),
  }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine(data => data.registrationDeadline <= data.startDate, {
  message: "Registration deadline must be before or on the event start date",
  path: ["registrationDeadline"],
});