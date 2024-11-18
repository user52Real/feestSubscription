import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderAvatar: String,
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'announcement', 'system'],
    default: 'text'
  },
  replyTo: {
    messageId: String,
    content: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  readBy: [{
    userId: String,
    readAt: Date
  }]
}, {
  timestamps: true
});

messageSchema.index({ eventId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);