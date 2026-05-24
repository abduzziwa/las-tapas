/**
 * Unit tests for app/api/utils/tikkie.ts
 *
 * Covers: demo-mode fallback, real API call construction,
 * error handling (non-OK response, network failure).
 */

import { createTikkiePaymentRequest } from '@/app/api/utils/tikkie';

const BASE_PARAMS = {
  amountInCents: 2550,
  description: 'Las Tapas — Sarah',
  merchantPaymentId: 'sdemo_session_001',
  apiKey: '',
  appToken: '',
};

// ─── Demo mode ───────────────────────────────────────────────────────────────

describe('createTikkiePaymentRequest — demo mode', () => {
  it('returns demo:true when apiKey is empty', async () => {
    const result = await createTikkiePaymentRequest(BASE_PARAMS);
    expect(result).not.toBeNull();
    expect(result!.demo).toBe(true);
  });

  it('returns demo:true when appToken is empty', async () => {
    const result = await createTikkiePaymentRequest({ ...BASE_PARAMS, apiKey: 'key', appToken: '' });
    expect(result!.demo).toBe(true);
  });

  it('encodes merchantPaymentId in the demo URL', async () => {
    const result = await createTikkiePaymentRequest(BASE_PARAMS);
    expect(result!.url).toContain(BASE_PARAMS.merchantPaymentId);
  });

  it('sets paymentRequestToken to "demo_<merchantPaymentId>"', async () => {
    const result = await createTikkiePaymentRequest(BASE_PARAMS);
    expect(result!.paymentRequestToken).toBe(`demo_${BASE_PARAMS.merchantPaymentId}`);
  });

  it('does not call fetch in demo mode', async () => {
    const spy = jest.spyOn(global, 'fetch');
    await createTikkiePaymentRequest(BASE_PARAMS);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ─── Real API mode ────────────────────────────────────────────────────────────

describe('createTikkiePaymentRequest — real API mode', () => {
  const REAL_PARAMS = { ...BASE_PARAMS, apiKey: 'test-api-key', appToken: 'test-app-token' };

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        url: 'https://tikkie.me/pay/real/abc123',
        paymentRequestToken: 'real_token_abc123',
      }),
    } as Response);
  });

  afterEach(() => jest.restoreAllMocks());

  it('POSTs to the correct Tikkie endpoint', async () => {
    await createTikkiePaymentRequest(REAL_PARAMS);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.abnamro.com/v1/tikkie/paymentrequests',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('sends correct Authorization and API-Key headers', async () => {
    await createTikkiePaymentRequest(REAL_PARAMS);
    const [, init] = (fetch as jest.Mock).mock.calls[0];
    expect(init.headers['API-Key']).toBe('test-api-key');
    expect(init.headers['Authorization']).toBe('Bearer test-app-token');
  });

  it('includes amountInCents and merchantPaymentId in the body', async () => {
    await createTikkiePaymentRequest(REAL_PARAMS);
    const [, init] = (fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.amountInCents).toBe(2550);
    expect(body.merchantPaymentId).toBe('sdemo_session_001');
  });

  it('returns the URL and token from the API response', async () => {
    const result = await createTikkiePaymentRequest(REAL_PARAMS);
    expect(result!.url).toBe('https://tikkie.me/pay/real/abc123');
    expect(result!.paymentRequestToken).toBe('real_token_abc123');
    expect(result!.demo).toBe(false);
  });

  it('returns null when the API responds with a non-OK status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: async () => 'Unprocessable Entity',
    } as unknown as Response);

    const result = await createTikkiePaymentRequest(REAL_PARAMS);
    expect(result).toBeNull();
  });

  it('returns null when fetch throws a network error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const result = await createTikkiePaymentRequest(REAL_PARAMS);
    expect(result).toBeNull();
  });
});
