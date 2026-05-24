/**
 * Route tests for GET /api/sessions/check
 *
 * Verifies the session health-check endpoint used by AuthGuard's
 * 10-second polling to detect when a supervisor has checked out a guest.
 */

jest.mock('@/app/api/models/Connection', () => ({ __esModule: true, default: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/api/models/session', () => ({
  Session: { findOne: jest.fn() },
}));

import { GET } from '@/app/api/sessions/check/route';
import { Session } from '@/app/api/models/session';

const mockFindOne = Session.findOne as jest.Mock;

function makeRequest(sessionId?: string): Request {
  const url = sessionId
    ? `http://localhost/api/sessions/check?sessionId=${sessionId}`
    : 'http://localhost/api/sessions/check';
  return new Request(url);
}

describe('GET /api/sessions/check', () => {
  beforeEach(() => mockFindOne.mockReset());

  it('returns { active: true } for a session with status "active"', async () => {
    mockFindOne.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: 'active' }) }) });
    const res = await GET(makeRequest('s_active_123'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.active).toBe(true);
  });

  it('returns { active: false } for a session with status "inactive"', async () => {
    mockFindOne.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: 'inactive' }) }) });
    const res = await GET(makeRequest('s_inactive_456'));
    const body = await res.json();
    expect(body.active).toBe(false);
  });

  it('returns { active: false } when session does not exist', async () => {
    mockFindOne.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) });
    const res = await GET(makeRequest('s_unknown'));
    const body = await res.json();
    expect(body.active).toBe(false);
  });

  it('returns { active: false } when no sessionId is provided', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.active).toBe(false);
  });

  it('returns { active: true } on a DB error (fail-safe — never kick out on error)', async () => {
    mockFindOne.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('DB timeout')) }) });
    const res = await GET(makeRequest('s_error_case'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.active).toBe(true);
  });
});
