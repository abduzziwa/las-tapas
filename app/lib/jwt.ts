import { SignJWT, jwtVerify } from 'jose';

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? process.env.QR_SECRET ?? 'change-me-in-production'
  );

export interface StaffPayload {
  employeeId: string;
  name: string;
  role: string;
}

export async function signStaffToken(payload: StaffPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret());
}

export async function verifyStaffToken(token: string): Promise<StaffPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as StaffPayload;
  } catch {
    return null;
  }
}
