import { NextResponse } from "next/server";
import connectToDatabase from "../../models/Connection";
import { Employees } from "../../models/employees";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { employeeId } = await request.json();

    const employee = await Employees.findOne({ employeeId });

    if (!employee) {
      return NextResponse.json({ message: 'Employee Not Found' }, { status: 404 });
    }

    // Just send role and employeeId in response
    return NextResponse.json({ 
      redirectUrl: `/${employee.role}`,
      employeeId: employeeId 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}