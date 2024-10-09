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
    enum: ["available", "occupied"], // Status options
    default: "available",
  },
  occupiedBy: {  // Added to track who occupies the table
    type: String,
    default: "none",  // Default value when table is not occupied
  },
});

export const Tables = mongoose.models.Tables || mongoose.model('Tables', tableSchema, 'tables');
