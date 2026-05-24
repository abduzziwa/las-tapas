import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffToken } from '@/app/lib/jwt';
import connectToDatabase from '../../models/Connection';
import { DailyAssignment } from '../../models/DailyAssignment';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('staff_session')?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const payload = await verifyStaffToken(token);
  if (!payload) return NextResponse.json({ message: 'Invalid session' }, { status: 401 });

  await connectToDatabase();

  const today = new Date().toISOString().split('T')[0];

  const assignment = await DailyAssignment.findOne({
    employeeId: payload.employeeId,
    date: today,
  }).lean() as { assignedRole: string } | null;

  return NextResponse.json({
    employeeId:   payload.employeeId,
    name:         payload.name,
    baseRole:     payload.role,
    assignedRole: assignment?.assignedRole ?? null,
    date:         today,
  });
}
