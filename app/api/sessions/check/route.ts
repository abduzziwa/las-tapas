import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { Session } from '../../models/session';

// GET /api/sessions/check?sessionId=xxx
// Used by AuthGuard to poll session health every 10s.
// Returns { active: true/false } — client redirects to /goodbye when active becomes false.
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ active: false }, { status: 200 });
    }

    const session = await Session.findOne({ sessionId }).select('status').lean() as { status: string } | null;

    return NextResponse.json(
      { active: session?.status === 'active' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SessionCheck] Error:', error);
    // On error, return active=true to avoid false logouts
    return NextResponse.json({ active: true }, { status: 200 });
  }
}
