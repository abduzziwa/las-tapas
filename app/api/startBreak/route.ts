import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import Break from '../models/Break';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { employeeId, shiftId } = await req.json();
        if (!employeeId || !shiftId) {
            return NextResponse.json({ success: false, error: 'Employee ID and Shift ID are required' }, { status: 400 });
        }

        const breakStart = new Date();
        const breakEntry = await Break.create({ employeeId, shiftId, breakStart });
        return NextResponse.json({ success: true, breakEntry }, { status: 200 });
    } catch (error) {
        console.error('Failed to start break:', error);
        return NextResponse.json({ success: false, error: 'Failed to start break' }, { status: 500 });
    }
}
