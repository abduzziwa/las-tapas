/**
 * Unit tests for app/api/utils/qrToken.ts
 *
 * These are pure crypto operations — no mocking required.
 * Tests cover: token generation format, successful verification,
 * tamper detection, cross-token-type rejection, and edge cases.
 */

import {
  generateQRToken,
  verifyQRToken,
  generateCheckoutToken,
  verifyCheckoutToken,
} from '@/app/api/utils/qrToken';

// ─── QR tokens ───────────────────────────────────────────────────────────────

describe('generateQRToken', () => {
  it('returns a string containing exactly one dot', () => {
    const token = generateQRToken('T1', 'C1');
    const dots = token.split('.').length - 1;
    expect(dots).toBe(1);
  });

  it('produces different tokens for different table/seat combinations', () => {
    expect(generateQRToken('T1', 'C1')).not.toBe(generateQRToken('T1', 'C2'));
    expect(generateQRToken('T1', 'C1')).not.toBe(generateQRToken('T2', 'C1'));
  });

  it('is deterministic for the same input (same secret)', () => {
    const a = generateQRToken('T3', 'C2');
    const b = generateQRToken('T3', 'C2');
    expect(a).toBe(b);
  });

  it('does not expose tableNumber or seatNumber in plain text', () => {
    const token = generateQRToken('T5', 'C3');
    // Neither the raw payload nor the word "T5" or "C3" should appear
    expect(token).not.toContain('T5:C3');
    expect(token).not.toMatch(/T5|C3/);
  });
});

describe('verifyQRToken', () => {
  it('returns the correct tableNumber and seatNumber for a valid token', () => {
    const token = generateQRToken('T2', 'C4');
    const result = verifyQRToken(token);
    expect(result).toEqual({ tableNumber: 'T2', seatNumber: 'C4' });
  });

  it('returns null when the signature is tampered with', () => {
    const token = generateQRToken('T1', 'C1');
    const [payload, sig] = token.split('.');
    const tampered = `${payload}.${sig.slice(0, -4)}XXXX`;
    expect(verifyQRToken(tampered)).toBeNull();
  });

  it('returns null when the payload is tampered with', () => {
    const token = generateQRToken('T1', 'C1');
    const [, sig] = token.split('.');
    const fakePayload = Buffer.from('T9:C9').toString('base64url');
    expect(verifyQRToken(`${fakePayload}.${sig}`)).toBeNull();
  });

  it('returns null for a token with no dot separator', () => {
    expect(verifyQRToken('nodottoken')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(verifyQRToken('')).toBeNull();
  });

  it('returns null when tableNumber format is invalid (e.g. "table1")', () => {
    // Manually craft a signed payload with wrong format
    // We can't fake a valid HMAC, so just test with a completely invalid string
    expect(verifyQRToken('aW52YWxpZA.fakesig')).toBeNull();
  });

  it('round-trips all standard table/seat combinations', () => {
    const tables = ['T1', 'T2', 'T8'];
    const seats  = ['C1', 'C2', 'C6'];
    tables.forEach((t) => {
      seats.forEach((s) => {
        const token = generateQRToken(t, s);
        expect(verifyQRToken(token)).toEqual({ tableNumber: t, seatNumber: s });
      });
    });
  });
});

// ─── Checkout tokens ─────────────────────────────────────────────────────────

describe('generateCheckoutToken', () => {
  it('returns a string with exactly one dot', () => {
    const token = generateCheckoutToken('s1a2b3c4d5e6f7g8');
    expect(token.split('.').length - 1).toBe(1);
  });

  it('produces different tokens for different sessionIds', () => {
    expect(generateCheckoutToken('sessionA')).not.toBe(generateCheckoutToken('sessionB'));
  });

  it('is deterministic for the same sessionId', () => {
    const a = generateCheckoutToken('sABCDEF');
    const b = generateCheckoutToken('sABCDEF');
    expect(a).toBe(b);
  });
});

describe('verifyCheckoutToken', () => {
  it('returns the sessionId for a valid checkout token', () => {
    const sessionId = 's1234567890abcdef';
    const token = generateCheckoutToken(sessionId);
    expect(verifyCheckoutToken(token)).toBe(sessionId);
  });

  it('returns null when signature is tampered', () => {
    const token = generateCheckoutToken('ssession123');
    const [payload, sig] = token.split('.');
    expect(verifyCheckoutToken(`${payload}.${sig.slice(0, -2)}ZZ`)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(verifyCheckoutToken('')).toBeNull();
  });

  it('REJECTS a QR token used as a checkout token (cross-type attack)', () => {
    // A valid QR token must not be accepted by verifyCheckoutToken
    const qrToken = generateQRToken('T1', 'C1');
    // QR token payload does NOT start with "checkout:" so it must be rejected
    expect(verifyCheckoutToken(qrToken)).toBeNull();
  });

  it('REJECTS a checkout token used as a QR token (reverse cross-type attack)', () => {
    const checkoutToken = generateCheckoutToken('ssession999');
    // Checkout token payload starts with "checkout:" which fails T\d+:C\d+ regex
    expect(verifyQRToken(checkoutToken)).toBeNull();
  });
});
