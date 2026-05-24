import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffToken } from '@/app/lib/jwt';
import connectToDatabase from '../../models/Connection';
import { DailyAssignment } from '../../models/DailyAssignment';
import { Employees } from '../../models/employees';

const MANAGER_ROLES = ['manager', 'admin', 'cashier'];

async function requireManager(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('staff_session')?.value;
  if (!token) return null;
  const payload = await verifyStaffToken(token);
  if (!payload || !MANAGER_ROLES.includes(payload.role)) return null;
  return payload.employeeId;
}

// GET /api/admin/assignments?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const managerId = await requireManager(req);
  if (!managerId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await connectToDatabase();

  const date = new URL(req.url).searchParams.get('date') ??
    new Date().toISOString().split('T')[0];

  const [employees, assignments] = await Promise.all([
    Employees.find({ isActive: true }).lean(),
    DailyAssignment.find({ date }).lean(),
  ]);

  const assignmentMap = Object.fromEntries(
    (assignments as unknown as { employeeId: string; assignedRole: string }[])
      .map(a => [a.employeeId, a.assignedRole])
  );

  return NextResponse.json({
    date,
    staff: (employees as unknown as { employeeId: string; name: string; role: string }[]).map(e => ({
      employeeId:   e.employeeId,
      name:         e.name,
      baseRole:     e.role,
      assignedRole: assignmentMap[e.employeeId] ?? null,
    })),
  });
}

// POST /api/admin/assignments
// body: { date: "YYYY-MM-DD", assignments: [{ employeeId, assignedRole: string | null }] }
export async function POST(req: NextRequest) {
  const managerId = await requireManager(req);
  if (!managerId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await connectToDatabase();

  const body = await req.json();
  const { date, assignments } = body as {
    date: string;
    assignments: { employeeId: string; assignedRole: string | null }[];
  };

  if (!date || !Array.isArray(assignments)) {
    return NextResponse.json({ message: 'date and assignments[] are required' }, { status: 400 });
  }

  await Promise.all(
    assignments.map(({ employeeId, assignedRole }) => {
      if (!assignedRole) {
        return DailyAssignment.deleteOne({ employeeId, date });
      }
      return DailyAssignment.findOneAndUpdate(
        { employeeId, date },
        { employeeId, date, assignedRole, assignedBy: managerId },
        { upsert: true, new: true }
      );
    })
  );

  return NextResponse.json({ message: 'Assignments saved' });
}
