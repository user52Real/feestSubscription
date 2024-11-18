import mongoose, { Schema, Document } from "mongoose";

export interface IWaitlist extends Document {
  eventId: string;
  userId: string;
  position: number;
  joinedAt: Date;
  status: "waiting" | "promoted" | "expired";
  notificationsSent: {
    promoted?: Date;
    reminder?: Date;
  };
}

const WaitlistSchema = new Schema({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  position: { type: Number, required: true },
  joinedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["waiting", "promoted", "expired"],
    default: "waiting"
  },
  notificationsSent: {
    promoted: Date,
    reminder: Date
  }
}, {
  timestamps: true
});

// Create compound index for unique waitlist entries
WaitlistSchema.index({ eventId: 1, userId: 1 }, { unique: true });
WaitlistSchema.index({ eventId: 1, position: 1 });

export const Waitlist = mongoose.models.Waitlist || mongoose.model<IWaitlist>("Waitlist", WaitlistSchema);
