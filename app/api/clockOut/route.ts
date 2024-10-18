import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import Shift from '../models/Shift';
import Break from '../models/Break';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { shiftId } = await req.json();
        if (!shiftId) {
            return NextResponse.json({ success: false, error: 'Shift ID is required' }, { status: 400 });
        }

        const shiftEnd = new Date();
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            return NextResponse.json({ success: false, error: 'Shift not found' }, { status: 404 });
        }

        const breaks = await Break.find({ shiftId });
        const totalBreakTime = breaks.reduce((total, breakEntry) => {
            if (breakEntry.breakStart && breakEntry.breakEnd) {
                return total + (new Date(breakEntry.breakEnd).getTime() - new Date(breakEntry.breakStart).getTime());
            }
            return total;
        }, 0);

        shift.shiftEnd = shiftEnd;
        shift.totalBreakTime = totalBreakTime;
        shift.totalWorkTime = shiftEnd.getTime() - shift.shiftStart.getTime() - totalBreakTime;

        await shift.save();
        return NextResponse.json({ success: true, shift }, { status: 200 });
    } catch (error) {
        console.error('Failed to clock out:', error);
        return NextResponse.json({ success: false, error: 'Failed to clock out' }, { status: 500 });
    }
}
