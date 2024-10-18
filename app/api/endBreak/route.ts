import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import Break from '../models/Break';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { breakId } = await req.json();
        if (!breakId) {
            return NextResponse.json({ success: false, error: 'Break ID is required' }, { status: 400 });
        }

        const breakEnd = new Date();
        const breakEntry = await Break.findByIdAndUpdate(breakId, { breakEnd }, { new: true });
        if (!breakEntry) {
            return NextResponse.json({ success: false, error: 'Break not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, breakEntry }, { status: 200 });
    } catch (error) {
        console.error('Failed to end break:', error);
        return NextResponse.json({ success: false, error: 'Failed to end break' }, { status: 500 });
    }
}
