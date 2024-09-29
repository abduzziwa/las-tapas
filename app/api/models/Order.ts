import mongoose, { Schema } from "mongoose";


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
        modifications: String,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      modification: String 
    },
  ],
  status: {
    type: String,
    required: true,
    enum: ['notYetOrdered', 'ordered', 'preparing', 'ready', 'served'],
  },
  timestamps: {
    orderedAt: {
      type: Date,
    },
    preparingAt: {
      type: Date,
    },
    readyAt: {
      type: Date,
    },
    servedAt: {
      type: Date,
    }
  },
});

export const Orders = mongoose.models.Orders || mongoose.model('Orders', orderSchema, 'orders');
// export const Orders = model('orders', orderSchema, 'orders');