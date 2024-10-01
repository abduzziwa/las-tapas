import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import { Employees } from '../models/employees';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { employeeId } = await req.json();

        const result = employeeId
            ? await Employees.findOne({ employeeId })
            : await Employees.find();

        if (!result) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ message: 'Error fetching employees' }, { status: 500 });
    }
}
