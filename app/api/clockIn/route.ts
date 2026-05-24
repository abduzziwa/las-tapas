import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import Shift from '../models/Shift';
import { log } from '../utils/auditLogger';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { employeeId } = await req.json();
        if (!employeeId) {
            return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
        }

        const shiftStart = new Date();
        const shift = await Shift.create({ employeeId, shiftStart });
        log({ eventType: 'employee.clockin', actor: { type: 'waiter', id: String(employeeId) } });
        return NextResponse.json({ success: true, shift }, { status: 200 });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        return NextResponse.json({ success: false, error: 'Failed to connect to the database' }, { status: 500 });
    }
}
