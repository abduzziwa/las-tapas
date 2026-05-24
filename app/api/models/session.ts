import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  lastActiveTable: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  seatNumber: {
    type: String,
    required: true,
  },
  guestName: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
});

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema, 'sessions');
