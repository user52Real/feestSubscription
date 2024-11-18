import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['invited', 'confirmed', 'declined', 'waitlist'],
    default: 'invited' 
  },
  role: {
    type: String,
    enum: ['attendee', 'coHost', 'moderator'],
    default: 'attendee'
  },
  dietaryPreferences: [String],
  plusOne: {
    name: String,
    dietaryPreferences: [String]
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date,
  invitedBy: String,
  invitedAt: {
    type: Date,
    default: Date.now
  },
  responseDate: Date,
  notes: String
}, {
  timestamps: true
});

// Add compound index to prevent duplicate registrations
guestSchema.index({ eventId: 1, status: 1 });
guestSchema.index({ userId: 1, eventId: 1 }, { unique: true });
guestSchema.index({ email: 1 });

export const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);