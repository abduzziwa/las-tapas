/**
 * Unit tests for app/api/utils/auditLogger.ts
 *
 * Verifies fire-and-forget behaviour: the function returns void immediately,
 * never throws, and passes the correct shape to AuditLog.create().
 */

jest.mock('@/app/api/models/Connection', () => ({ __esModule: true, default: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/api/models/AuditLog', () => ({
  AuditLog: { create: jest.fn().mockResolvedValue({}) },
}));

import { log } from '@/app/api/utils/auditLogger';
import connectToDatabase from '@/app/api/models/Connection';
import { AuditLog } from '@/app/api/models/AuditLog';

const mockCreate  = AuditLog.create as jest.Mock;
const mockConnect = connectToDatabase as jest.Mock;

describe('log (fire-and-forget audit logger)', () => {
  beforeEach(() => {
    mockCreate.mockClear();
    mockConnect.mockClear();
  });

  it('returns void synchronously — does not return a Promise', () => {
    const result = log({ eventType: 'order.created' });
    expect(result).toBeUndefined();
  });

  it('calls connectToDatabase before creating the log entry', async () => {
    log({ eventType: 'session.started', sessionId: 's123', tableNumber: 'T1' });
    await new Promise((r) => setTimeout(r, 20));
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('calls AuditLog.create with the correct fields', async () => {
    log({
      eventType: 'order.payment.paid',
      orderId: '0042',
      tableNumber: 'T3',
      sessionId: 's_abc',
      actor: { type: 'waiter', id: 'E001', name: 'Carlos' },
      details: { paymentMethod: 'pin', amount: 2550 },
    });
    await new Promise((r) => setTimeout(r, 20));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'order.payment.paid',
        orderId: '0042',
        tableNumber: 'T3',
        sessionId: 's_abc',
        actor: { type: 'waiter', id: 'E001', name: 'Carlos' },
        details: { paymentMethod: 'pin', amount: 2550 },
      })
    );
  });

  it('generates a unique eventId on each call', async () => {
    log({ eventType: 'table.occupied' });
    log({ eventType: 'table.occupied' });
    await new Promise((r) => setTimeout(r, 20));

    const ids = mockCreate.mock.calls.map((c: unknown[]) => (c[0] as { eventId: string }).eventId);
    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[0]).toMatch(/^[0-9a-f]{16}$/);
  });

  it('does NOT throw if AuditLog.create rejects', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB write failed'));
    expect(() => log({ eventType: 'employee.clockin' })).not.toThrow();
    await new Promise((r) => setTimeout(r, 20));
  });

  it('does NOT throw if connectToDatabase rejects', async () => {
    mockConnect.mockRejectedValueOnce(new Error('Connection refused'));
    expect(() => log({ eventType: 'session.checkout' })).not.toThrow();
    await new Promise((r) => setTimeout(r, 20));
  });
});
