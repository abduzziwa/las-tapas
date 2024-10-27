// app/api/employees/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "../models/Connection";
import { Employees } from "../models/employees";


// GET - Fetch all employees
export async function GET() {
  try {
    await connectToDatabase();
    const employees = await Employees.find({}).sort({ createdAt: -1 });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json(
      { message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['employeeId', 'name', 'email', 'role', 'shiftDetails'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if employee with same ID or email already exists
    const existingEmployee = await Employees.findOne({
      $or: [
        { employeeId: body.employeeId },
        { email: body.email }
      ]
    });

    if (existingEmployee) {
      return NextResponse.json(
        { message: "Employee with this ID or email already exists" },
        { status: 409 }
      );
    }

    const newEmployee = new Employees({
      employeeId: body.employeeId,
      name: body.name,
      email: body.email,
      role: body.role,
      shiftDetails: body.shiftDetails,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
    });

    await newEmployee.save();
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("Failed to create employee:", error);
    return NextResponse.json(
      { message: "Failed to create employee" },
      { status: 500 }
    );
  }
}

// PUT - Update existing employee
export async function PUT(request: Request) {
    try {
      await connectToDatabase();
      const { searchParams } = new URL(request.url);
      const currentEmployeeId = searchParams.get('employeeId');
      
      if (!currentEmployeeId) {
        return NextResponse.json(
          { message: "Current Employee ID is required" },
          { status: 400 }
        );
      }
  
      const body = await request.json();
  
      // First, fetch the current employee to check their status
      const currentEmployee = await Employees.findOne({ employeeId: currentEmployeeId });
  
      if (!currentEmployee) {
        return NextResponse.json(
          { message: "Employee not found" },
          { status: 404 }
        );
      }
  
      // Check if trying to update employeeId
      if (body.employeeId && body.employeeId !== currentEmployeeId) {
        // Only allow employeeId update if employee is inactive
        if (currentEmployee.isActive) {
          return NextResponse.json(
            { message: "Cannot update Employee ID of an active employee" },
            { status: 403 }
          );
        }
  
        // Check if the new employeeId is already in use
        const existingEmployeeWithNewId = await Employees.findOne({
          employeeId: body.employeeId
        });
  
        if (existingEmployeeWithNewId) {
          return NextResponse.json(
            { message: "New Employee ID is already in use" },
            { status: 409 }
          );
        }
      }
  
      // Check if email is being updated and if it's already in use by another employee
      if (body.email) {
        const existingEmployee = await Employees.findOne({
          email: body.email,
          employeeId: { $ne: currentEmployeeId }
        });
  
        if (existingEmployee) {
          return NextResponse.json(
            { message: "Email is already in use by another employee" },
            { status: 409 }
          );
        }
      }
  
      const updateData = {
        ...body.employeeId && { employeeId: body.employeeId },
        ...body.name && { name: body.name },
        ...body.email && { email: body.email },
        ...body.role && { role: body.role },
        ...body.shiftDetails && { shiftDetails: body.shiftDetails },
        ...(typeof body.isActive === 'boolean') && { isActive: body.isActive },
      };
  
      const updatedEmployee = await Employees.findOneAndUpdate(
        { employeeId: currentEmployeeId },
        { $set: updateData },
        { new: true }
      );
  
      if (!updatedEmployee) {
        return NextResponse.json(
          { message: "Failed to update employee" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(updatedEmployee);
    } catch (error) {
      console.error("Failed to update employee:", error);
      return NextResponse.json(
        { message: "Failed to update employee" },
        { status: 500 }
      );
    }
  }

// DELETE - Remove employee
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const deletedEmployee = await Employees.findOneAndDelete({ employeeId });

    if (!deletedEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Employee deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json(
      { message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}