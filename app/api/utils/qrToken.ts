import crypto from 'crypto';

const SECRET = process.env.QR_SECRET || 'las-tapas-dev-secret-change-in-production';

/**
 * Produces an opaque HMAC-signed token encoding tableNumber and seatNumber.
 * Format: base64url(T1:C2).base64url(hmac_sha256(secret, T1:C2))
 * Example output: VDFDMg.a7b3c2d1e5f64a...  (unreadable to the customer)
 */
export function generateQRToken(tableNumber: string, seatNumber: string): string {
  const payload = `${tableNumber}:${seatNumber}`;
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

/**
 * Verifies the token signature and returns { tableNumber, seatNumber } if valid.
 * Returns null if the token is missing, malformed, or tampered with.
 */
export function verifyQRToken(
  token: string
): { tableNumber: string; seatNumber: string } | null {
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return null;

    const payloadB64 = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);

    if (!payloadB64 || !sig) return null;

    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('base64url');

    // Constant-time comparison prevents timing attacks
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const colonIndex = payload.indexOf(':');
    if (colonIndex === -1) return null;
    const tableNumber = payload.slice(0, colonIndex);
    const seatNumber  = payload.slice(colonIndex + 1);
    if (!tableNumber || !seatNumber) return null;

    return { tableNumber, seatNumber };
  } catch {
    return null;
  }
}

export function generateCheckoutToken(sessionId: string): string {
  const payload = `checkout:${sessionId}`;
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyCheckoutToken(token: string): string | null {
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return null;
    const payloadB64 = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);
    if (!payloadB64 || !sig) return null;

    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    if (!payload.startsWith('checkout:')) return null;

    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('base64url');

    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    return payload.slice('checkout:'.length);
  } catch {
    return null;
  }
}
