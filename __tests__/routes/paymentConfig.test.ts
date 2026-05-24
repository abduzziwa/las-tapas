/**
 * Route tests for GET and PUT /api/admin/payments/config
 *
 * Verifies: secret masking on GET, selective field update on PUT,
 * audit logging, and the upsert (singleton) behaviour.
 */

jest.mock('@/app/api/models/Connection',    () => ({ __esModule: true, default: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/api/utils/auditLogger',    () => ({ log: jest.fn() }));
jest.mock('@/app/api/models/PaymentConfig', () => ({
  PaymentConfig: { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
}));

import { GET, PUT } from '@/app/api/admin/payments/config/route';
import { PaymentConfig } from '@/app/api/models/PaymentConfig';
import { log as auditLog } from '@/app/api/utils/auditLogger';

const mockFindOne          = PaymentConfig.findOne          as jest.Mock;
const mockFindOneAndUpdate = PaymentConfig.findOneAndUpdate as jest.Mock;
const mockAuditLog         = auditLog as jest.Mock;

function makePUT(body: object) {
  return new Request('http://localhost/api/admin/payments/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/payments/config', () => {
  beforeEach(() => mockFindOne.mockReset());

  it('returns tikkieApiKeySet:true when key is set (does NOT return the key)', async () => {
    mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ tikkieApiKey: 'real-secret-key', tikkieAppToken: '', iban: 'NL91ABNA', accountHolder: 'Las Tapas', enabledMethods: ['pin'] }) });
    const res  = await GET();
    const body = await res.json();
    expect(body.tikkieApiKeySet).toBe(true);
    expect(body.tikkieApiKey).toBeUndefined();
  });

  it('returns tikkieApiKeySet:false when key is empty string', async () => {
    mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ tikkieApiKey: '', tikkieAppToken: 'token', iban: '', accountHolder: '', enabledMethods: [] }) });
    const res  = await GET();
    const body = await res.json();
    expect(body.tikkieApiKeySet).toBe(false);
    expect(body.tikkieAppTokenSet).toBe(true);
  });

  it('returns default values when config document does not exist', async () => {
    mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const res  = await GET();
    const body = await res.json();
    expect(body.enabledMethods).toEqual(['pin', 'cash']);
    expect(body.tikkieApiKeySet).toBe(false);
  });

  it('returns 200', async () => {
    mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const res = await GET();
    expect(res.status).toBe(200);
  });
});

// ─── PUT ─────────────────────────────────────────────────────────────────────

describe('PUT /api/admin/payments/config', () => {
  beforeEach(() => {
    mockFindOneAndUpdate.mockReset();
    mockAuditLog.mockClear();
    mockFindOneAndUpdate.mockResolvedValue({});
  });

  it('updates iban and accountHolder when provided', async () => {
    await PUT(makePUT({ iban: 'NL91ABNA', accountHolder: 'Las Tapas BV', updatedBy: 'E005' }));
    const [, update] = mockFindOneAndUpdate.mock.calls[0];
    expect(update.$set.iban).toBe('NL91ABNA');
    expect(update.$set.accountHolder).toBe('Las Tapas BV');
  });

  it('does NOT update tikkieApiKey when it is not in the request body', async () => {
    await PUT(makePUT({ iban: 'NL91ABNA', updatedBy: 'E005' }));
    const [, update] = mockFindOneAndUpdate.mock.calls[0];
    expect(update.$set.tikkieApiKey).toBeUndefined();
  });

  it('clears tikkieApiKey when an empty string is explicitly sent', async () => {
    await PUT(makePUT({ tikkieApiKey: '', updatedBy: 'E005' }));
    const [, update] = mockFindOneAndUpdate.mock.calls[0];
    expect(update.$set.tikkieApiKey).toBe('');
  });

  it('updates tikkieApiKey when a non-empty string is sent', async () => {
    await PUT(makePUT({ tikkieApiKey: 'new-api-key', updatedBy: 'E005' }));
    const [, update] = mockFindOneAndUpdate.mock.calls[0];
    expect(update.$set.tikkieApiKey).toBe('new-api-key');
  });

  it('trims whitespace from string fields', async () => {
    await PUT(makePUT({ iban: '  NL91ABNA  ', updatedBy: 'E005' }));
    const [, update] = mockFindOneAndUpdate.mock.calls[0];
    expect(update.$set.iban).toBe('NL91ABNA');
  });

  it('calls audit log with event "payment.config.updated"', async () => {
    await PUT(makePUT({ iban: 'NL91ABNA', updatedBy: 'Sofia' }));
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'payment.config.updated' })
    );
  });

  it('uses upsert:true so the singleton is created if missing', async () => {
    await PUT(makePUT({ enabledMethods: ['pin'], updatedBy: 'E005' }));
    const [, , options] = mockFindOneAndUpdate.mock.calls[0];
    expect(options.upsert).toBe(true);
  });

  it('returns 200 on success', async () => {
    const res = await PUT(makePUT({ iban: 'NL91ABNA', updatedBy: 'E005' }));
    expect(res.status).toBe(200);
  });
});
