import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../models/Connection';
import { Employees } from '../../models/employees';

// Returns whether setup is still needed
export async function GET() {
  try {
    await connectToDatabase();
    const count = await Employees.countDocuments();
    return NextResponse.json({ needsSetup: count === 0 });
  } catch {
    return NextResponse.json({ needsSetup: false }, { status: 500 });
  }
}

// Creates the first admin — only works when no employees exist
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const count = await Employees.countDocuments();
    if (count > 0) {
      return NextResponse.json(
        { message: 'Setup already completed. Please log in.' },
        { status: 403 }
      );
    }

    const { employeeId, name, email, password } = await req.json();

    if (!employeeId || !name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await Employees.create({
      employeeId,
      name,
      email,
      role:         'admin',
      password:     hashed,
      shiftDetails: 'Admin',
      isActive:     true,
    });

    return NextResponse.json({ message: 'Admin account created. You can now log in.' }, { status: 201 });
  } catch (error) {
    console.error('[setup] error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
