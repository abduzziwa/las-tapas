import mongoose, { Schema } from "mongoose";


const orderSchema = new Schema({
  orderId: {
    type: Number,
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
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      modification: String,
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      category: {
        type: String,
        required: true,
        enum: ['food', 'drink', 'dessert'],
      }
    },
  ],
  status: {
    type: String,
    required: true,
    enum: ['notYetOrdered', 'ordered', 'preparing', 'ready', 'served'],
  },
  payment: {
    type: String,
    required: true,
    enum: ['paid', 'unpaid', 'wantToPay'],
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