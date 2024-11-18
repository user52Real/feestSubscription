import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [] // Strip all attributes
  });
}

// Common validation schemas
export const eventSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .transform(sanitizeInput),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .transform(sanitizeInput),
  
  startDate: z.date()
    .min(new Date(), 'Start date must be in the future'),
  
  endDate: z.date(),
  
  location: z.object({
    venue: z.string().min(3).transform(sanitizeInput),
    address: z.string().min(5).transform(sanitizeInput),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }),
  
  capacity: z.number()
    .min(1, 'Capacity must be at least 1')
    .max(100000, 'Capacity must be less than 100,000'),
  
  visibility: z.enum(['public', 'private'])
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});