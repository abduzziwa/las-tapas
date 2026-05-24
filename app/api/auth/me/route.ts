import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffToken } from '@/app/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('staff_session')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const payload = await verifyStaffToken(token);
  if (!payload) {
    return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
  }

  return NextResponse.json({
    employeeId: payload.employeeId,
    name:       payload.name,
    role:       payload.role,
  });
}
