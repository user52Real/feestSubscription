import mongoose from 'mongoose';
import { UserRole } from '@/lib/auth/types';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.ATTENDEE
  },
  permissions: [{
    type: String
  }],
  lastLogin: Date,
  apiKey: String,
  apiKeyLastUsed: Date
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);