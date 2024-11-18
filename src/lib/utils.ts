import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeEvent(event: any) {
  if (!event) return null;
  
  const eventObj = event.toObject ? event.toObject() : event;
  
  return {
    id: eventObj._id.toString(),
    title: eventObj.title,
    description: eventObj.description,
    startDate: new Date(eventObj.startDate).toISOString(),
    endDate: new Date(eventObj.endDate).toISOString(),
    location: {
      venue: eventObj.location?.venue || '',
      address: eventObj.location?.address || '',
      coordinates: eventObj.location?.coordinates || null,
    },
    capacity: eventObj.capacity,
    status: eventObj.status,
    visibility: eventObj.visibility,
    organizerId: eventObj.organizerId,
    coHosts: eventObj.coHosts || [],
    recurring: eventObj.recurring || null,
    createdAt: new Date(eventObj.createdAt).toISOString(),
    updatedAt: new Date(eventObj.updatedAt).toISOString(),
    attendees: {
      confirmed: 0,
      waitlist: 0,
    },
  };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function absoluteUrl(path: string) {
  // First, try to use environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
  }
  
  // Fallback for development/testing
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`
  }
  
  // Local development fallback
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:${process.env.PORT || 3000}${path}`
  }
  
  // Final fallback
  return `https://${process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000'}${path}`
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-US").format(number)
}

// Stripe specific utils
export function formatStripePrice(amount: number) {
  return formatCurrency(amount / 100)
}

// Time utils
export function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) {
    return Math.floor(interval) + ' years ago'
  }
  
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months ago'
  }
  
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' days ago'
  }
  
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago'
  }
  
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago'
  }
  
  return Math.floor(seconds) + ' seconds ago'
}

// URL utils
export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

type ObjectWithStringKeys = { [key: string]: any };

// Object utils
export function removeEmpty<T extends ObjectWithStringKeys>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === null || value === undefined || value === '') {
      return acc;
    }

    if (Array.isArray(value)) {
      const filtered = value.filter(item => item !== null && item !== undefined && item !== '');
      if (filtered.length > 0) {
        acc[key as keyof T] = filtered as T[keyof T];
      }
      return acc;
    }

    if (typeof value === 'object') {
      const cleaned = removeEmpty(value);
      if (Object.keys(cleaned).length > 0) {
        acc[key as keyof T] = cleaned as T[keyof T];
      }
      return acc;
    }

    acc[key as keyof T] = value;
    return acc;
  }, {} as Partial<T>);
}


// Array utils
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// String utils
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/&/g, '-and-')   // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
}

// Validation utils
export function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Error handling utils
export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}