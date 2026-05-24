import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../models/Connection';
import { Employees } from '../../models/employees';
import { signStaffToken } from '@/app/lib/jwt';

const COOKIE = 'staff_session';

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { employeeId, password } = await req.json();

    if (!employeeId || !password) {
      return NextResponse.json({ message: 'Employee ID and password are required' }, { status: 400 });
    }

    const employee = await Employees.findOne({ employeeId }).lean() as {
      employeeId: string;
      name: string;
      role: string;
      password: string;
      isActive: boolean;
    } | null;

    // Vague error — don't reveal whether the ID exists
    if (!employee || !(await bcrypt.compare(password, employee.password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (!employee.isActive) {
      return NextResponse.json({ message: 'Account deactivated. Contact your manager.' }, { status: 403 });
    }

    const token = await signStaffToken({
      employeeId: employee.employeeId,
      name:       employee.name,
      role:       employee.role,
    });

    const res = NextResponse.json({
      employeeId: employee.employeeId,
      name:       employee.name,
      role:       employee.role,
    }, { status: 200 });

    res.cookies.set(COOKIE, token, {
      httpOnly:  true,
      sameSite:  'strict',
      path:      '/',
      maxAge:    60 * 60 * 12, // 12 hours
      secure:    process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (error) {
    console.error('[auth/login] error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
