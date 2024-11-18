// src/lib/activity/notifications.ts

import mongoose from 'mongoose';
import { pusherServer } from "@/lib/pusher";

// Define specific activity types as constants
export const ActivityTypes = {
  // Event activities
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_CANCELLED: 'event.cancelled',
  
  // Guest activities
  GUEST_INVITED: 'guest.invited',
  GUEST_UPDATED: 'guest.updated',
  GUEST_REGISTERED: 'guest.registered',
  GUEST_CANCELLED: 'guest.cancelled',
  GUEST_CHECKED_IN: 'guest.checked_in',
  GUEST_REMOVED: 'guest.removed',
  GUEST_WAITLISTED: 'guest.waitlisted',
  GUEST_PROMOTED: 'guest.promoted', // When moved from waitlist to attendee
  
  // Communication activities
  COMMENT_ADDED: 'comment.added',
  MESSAGE_SENT: 'message.sent',
} as const;

// Create type from constants
export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];

// Activity interface
export interface Activity {
  type: ActivityType;
  userId: string;
  eventId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Create Mongoose Schema for activities
const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: Object.values(ActivityTypes)
  },
  userId: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add indexes
activitySchema.index({ type: 1, eventId: 1 });
activitySchema.index({ userId: 1, createdAt: -1 });

// Create the model
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export async function createActivity({
  type,
  userId,
  eventId,
  metadata = {}
}: Omit<Activity, 'createdAt'>) {
  try {
    // Create activity in database
    const activity = await Activity.create({
      type,
      userId,
      eventId,
      metadata,
    });

    // Trigger real-time update via Pusher
    await pusherServer.trigger(
      `event-${eventId}`,
      'new-activity',
      {
        type,
        userId,
        metadata,
        createdAt: activity.createdAt,
      }
    );

    // Also trigger user-specific activity
    await pusherServer.trigger(
      `user-${userId}`,
      'new-activity',
      {
        type,
        eventId,
        metadata,
        createdAt: activity.createdAt,
      }
    );

    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

// Helper function to format activity messages
export function formatActivityMessage(activity: Activity): string {
  const messages: Record<ActivityType, string> = {
    [ActivityTypes.EVENT_CREATED]: "created a new event",
    [ActivityTypes.EVENT_UPDATED]: "updated event details",
    [ActivityTypes.EVENT_CANCELLED]: "cancelled the event",
    [ActivityTypes.GUEST_INVITED]: "invited a new guest",
    [ActivityTypes.GUEST_UPDATED]: "updated guest details",
    [ActivityTypes.GUEST_REGISTERED]: "registered for the event",
    [ActivityTypes.GUEST_CANCELLED]: "cancelled their registration",
    [ActivityTypes.GUEST_CHECKED_IN]: "checked in to the event",
    [ActivityTypes.GUEST_REMOVED]: "removed a guest",
    [ActivityTypes.GUEST_WAITLISTED]: "joined the waitlist",
    [ActivityTypes.GUEST_PROMOTED]: "was promoted from the waitlist",
    [ActivityTypes.COMMENT_ADDED]: "added a comment",
    [ActivityTypes.MESSAGE_SENT]: "sent a message"
  };

  return messages[activity.type] || "performed an action";
}

// Export activity types for use in other files
export { Activity as ActivityModel };