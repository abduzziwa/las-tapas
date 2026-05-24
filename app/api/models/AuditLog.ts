import mongoose, { Schema } from 'mongoose';

export type AuditEventType =
  | 'order.created'
  | 'order.status.preparing'
  | 'order.status.ready'
  | 'order.status.served'
  | 'order.payment.requested'
  | 'order.payment.paid'
  | 'table.occupied'
  | 'table.freed'
  | 'session.started'
  | 'session.checkout'
  | 'employee.clockin'
  | 'employee.clockout'
  | 'payment.config.updated';

const auditLogSchema = new Schema({
  eventId:     { type: String, required: true, unique: true },
  timestamp:   { type: Date, default: Date.now, index: true },
  eventType:   { type: String, required: true },
  orderId:     { type: String },
  tableNumber: { type: String },
  sessionId:   { type: String },
  actor: {
    type: { type: String, enum: ['customer', 'waiter', 'chef', 'bar', 'admin', 'system'] },
    id:   { type: String },
    name: { type: String },
  },
  details: {
    from:          { type: String },
    to:            { type: String },
    amount:        { type: Number },
    paymentMethod: { type: String },
    note:          { type: String },
    itemCount:     { type: Number },
    items:         { type: [String] },
  },
});

export const AuditLog = mongoose.models.AuditLog ||
  mongoose.model('AuditLog', auditLogSchema, 'auditlogs');
