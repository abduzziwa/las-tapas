import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "../models/Connection";
import { Employees } from "../models/employees";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const employees = await Employees.find({}, { password: 0 }).sort({ createdAt: -1 });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json({ message: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const requiredFields = ['employeeId', 'name', 'email', 'role', 'shiftDetails', 'password'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const existing = await Employees.findOne({
      $or: [{ employeeId: body.employeeId }, { email: body.email }],
    });
    if (existing) {
      return NextResponse.json({ message: "Employee with this ID or email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newEmployee = new Employees({
      employeeId:   body.employeeId,
      name:         body.name,
      email:        body.email,
      role:         body.role,
      shiftDetails: body.shiftDetails,
      isActive:     body.isActive ?? true,
      password:     hashedPassword,
    });

    await newEmployee.save();
    const { password: _p, ...safe } = newEmployee.toObject();
    void _p;
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    console.error("Failed to create employee:", error);
    return NextResponse.json({ message: "Failed to create employee" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const currentEmployeeId = searchParams.get('employeeId');

    if (!currentEmployeeId) {
      return NextResponse.json({ message: "employeeId query param is required" }, { status: 400 });
    }

    const body = await request.json();

    const current = await Employees.findOne({ employeeId: currentEmployeeId });
    if (!current) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // Prevent changing employeeId of an active employee
    if (body.employeeId && body.employeeId !== currentEmployeeId && current.isActive) {
      return NextResponse.json({ message: "Cannot update Employee ID of an active employee" }, { status: 403 });
    }

    // Check email uniqueness
    if (body.email && body.email !== current.email) {
      const emailTaken = await Employees.findOne({ email: body.email, employeeId: { $ne: currentEmployeeId } });
      if (emailTaken) {
        return NextResponse.json({ message: "Email already in use" }, { status: 409 });
      }
    }

    const update: Record<string, unknown> = {};
    if (body.employeeId)                        update.employeeId   = body.employeeId;
    if (body.name)                              update.name         = body.name;
    if (body.email)                             update.email        = body.email;
    if (body.role)                              update.role         = body.role;
    if (body.shiftDetails)                      update.shiftDetails = body.shiftDetails;
    if (typeof body.isActive === 'boolean')     update.isActive     = body.isActive;
    if (body.password)                          update.password     = await bcrypt.hash(body.password, 10);

    const updated = await Employees.findOneAndUpdate(
      { employeeId: currentEmployeeId },
      { $set: update },
      { new: true, projection: { password: 0 } }
    );

    if (!updated) {
      return NextResponse.json({ message: "Failed to update employee" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update employee:", error);
    return NextResponse.json({ message: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ message: "employeeId is required" }, { status: 400 });
    }

    const deleted = await Employees.findOneAndDelete({ employeeId });
    if (!deleted) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json({ message: "Failed to delete employee" }, { status: 500 });
  }
}
