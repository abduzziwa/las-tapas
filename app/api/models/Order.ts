import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  tableNumber: {
    type: String,
    required: true,
  },
  foodItems: [
    {
      foodId: {
        type: String,
        required: true,
      },
      foodName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  status: {
    type: String,
    required: true,
    enum: ['notYetOrdered', 'preparing', 'ready', 'delivered'],
  },
  timestamps: {
    orderedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

export const Orders = model('orders', orderSchema, 'orders');