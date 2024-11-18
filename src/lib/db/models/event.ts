// src/lib/db/models/event.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: {
    venue: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  status: "draft" | "published" | "cancelled";
  visibility: "public" | "private";
  organizerId: string;
  coHosts: string[];
  recurring?: {
    pattern: "daily" | "weekly" | "monthly";
    interval: number;
    endDate: Date;
  };
}

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: {
    venue: { type: String, required: true, default: 'No venue specified' },
    address: { type: String, required: true, default: 'No address specified' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  capacity: { type: Number, required: true },
  status: {
    type: String,
    enum: ["draft", "published", "cancelled"],
    default: "draft"
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private"
  },
  organizerId: { type: String, required: true },
  coHosts: [{ type: String }],
  recurring: {
    pattern: {
      type: String,
      enum: ["daily", "weekly", "monthly"]
    },
    interval: Number,
    endDate: Date
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes
EventSchema.index({ organizerId: 1, startDate: -1 });
EventSchema.index({ status: 1 });
EventSchema.index({ "location?.venue": 1 });
EventSchema.index({ title: "text", description: "text" });

const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export { Event };