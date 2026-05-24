import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import { Session } from '../models/session';

// PATCH /api/sessions — update guest name for a session
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const { sessionId, guestName } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ message: 'sessionId is required' }, { status: 400 });
    }

    const trimmed = typeof guestName === 'string' ? guestName.trim().slice(0, 50) : '';

    const session = await Session.findOneAndUpdate(
      { sessionId },
      { guestName: trimmed },
      { new: true }
    );

    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Name saved', guestName: trimmed }, { status: 200 });
  } catch (error) {
    console.error('Error updating guest name:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
