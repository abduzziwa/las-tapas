import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import { Employees } from '../models/employees';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { employeeId } = await req.json();
        if (!employeeId) {
            return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
        }

        const employee = await Employees.findOne({ employeeId });
        if (!employee) {
            return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, employee }, { status: 200 });
    } catch (error) {
        console.error('Error checking employee:', error);
        return NextResponse.json({ success: false, error: 'Error checking employee' }, { status: 500 });
    }
}
