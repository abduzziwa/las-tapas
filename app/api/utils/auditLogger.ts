import crypto from 'crypto';
import { AuditLog, AuditEventType } from '../models/AuditLog';
import connectToDatabase from '../models/Connection';

interface AuditEntry {
  eventType: AuditEventType;
  orderId?: string;
  tableNumber?: string;
  sessionId?: string;
  actor?: {
    type: 'customer' | 'waiter' | 'chef' | 'bar' | 'admin' | 'system';
    id: string;
    name?: string;
  };
  details?: {
    from?: string;
    to?: string;
    amount?: number;
    paymentMethod?: string;
    note?: string;
    itemCount?: number;
    items?: string[];
    staffInitiated?: boolean;
  };
}

/**
 * Fire-and-forget audit logger.
 * Never await this in route handlers — it must never block a response.
 */
export function log(entry: AuditEntry): void {
  connectToDatabase()
    .then(() =>
      AuditLog.create({
        eventId: crypto.randomBytes(8).toString('hex'),
        timestamp: new Date(),
        ...entry,
      })
    )
    .catch((err) => console.error('[AuditLog] Failed to write entry:', err));
}
