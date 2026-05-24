import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true,
  },
  seats: {  // Changed from capacity to seats to match your document
    type: Number,
    required: true,
    min: 1,
  },
  status: {  // Renamed from occupied to status
    type: String,
    enum: ["available", "occupied", "booked"], // Status options
    default: "available",
  },
  occupiedBy: {  // Array of sessionIds — one per seat currently active
    type: [String],
    default: [],
  },
});

export const Tables = mongoose.models.Tables || mongoose.model('Tables', tableSchema, 'tables');
