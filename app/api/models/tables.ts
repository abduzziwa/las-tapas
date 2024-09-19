import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  occupied: {
    type: String,
    enum: ["available", "occupied"],
    default: "available",
  },
  currentOrders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Order',
  },
});

export const Table =  mongoose.model('Table', tableSchema, 'tables');