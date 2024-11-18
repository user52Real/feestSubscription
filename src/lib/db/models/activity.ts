// src/lib/db/models/activity.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IActivity extends Document {
  type: string;
  userId: string;
  eventId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'event.created',
      'event.updated',
      'event.cancelled',
      'event.deleted',
      'guest.invited',
      'guest.confirmed',
      'guest.declined',
      'guest.checked_in',
      'guest.removed',
      'message.sent',
      'cohost.added',
      'cohost.removed',
      'settings.updated',
      'export.generated'
    ]
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  eventId: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient querying
ActivitySchema.index({ eventId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, eventId: 1 });

// Add text index for search functionality
ActivitySchema.index({
  'metadata.guestName': 'text',
  'metadata.changes': 'text'
});

// Middleware to validate metadata based on activity type
ActivitySchema.pre('save', function(next) {
  const activity = this as IActivity;
  
  // Validate metadata based on activity type
  switch (activity.type) {
    case 'event.updated':
      if (!activity.metadata?.changes) {
        return next(new Error('Event update activity requires changes in metadata'));
      }
      break;
      
    case 'guest.invited':
    case 'guest.confirmed':
    case 'guest.declined':
    case 'guest.checked_in':
    case 'guest.removed':
      if (!activity.metadata?.guestId) {
        return next(new Error('Guest-related activity requires guestId in metadata'));
      }
      break;
      
    case 'message.sent':
      if (!activity.metadata?.messageId) {
        return next(new Error('Message activity requires messageId in metadata'));
      }
      break;
  }
  
  next();
});

// Static methods
ActivitySchema.statics = {
  /**
   * Get recent activities for an event
   */
  async getRecentEventActivities(eventId: string, limit = 20) {
    return this.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Get recent activities for a user
   */
  async getUserActivities(userId: string, limit = 20) {
    return this.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Get activities by type
   */
  async getActivitiesByType(type: string, eventId?: string) {
    const query = eventId ? { type, eventId } : { type };
    return this.find(query)
      .sort({ createdAt: -1 })
      .exec();
  },

  /**
   * Search activities
   */
  async searchActivities(searchTerm: string, eventId?: string) {
    const query = eventId 
      ? { eventId, $text: { $search: searchTerm } }
      : { $text: { $search: searchTerm } };
      
    return this.find(query)
      .sort({ score: { $meta: "textScore" } })
      .exec();
  }
};

// Instance methods
ActivitySchema.methods = {
  /**
   * Format activity message
   */
  formatMessage() {
    const messages: Record<string, string> = {
      'event.created': 'created a new event',
      'event.updated': 'updated event details',
      'event.cancelled': 'cancelled the event',
      'event.deleted': 'deleted the event',
      'guest.invited': 'invited a new guest',
      'guest.confirmed': 'confirmed attendance',
      'guest.declined': 'declined attendance',
      'guest.checked_in': 'checked in to the event',
      'guest.removed': 'removed a guest',
      'message.sent': 'sent a message',
      'cohost.added': 'added a co-host',
      'cohost.removed': 'removed a co-host',
      'settings.updated': 'updated event settings',
      'export.generated': 'generated an export'
    };

    return messages[this.type] || 'performed an action';
  }
};

// Create model
const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export { Activity };