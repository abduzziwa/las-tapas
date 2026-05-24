import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { Session } from '../../models/session';
import { generateCheckoutToken } from '../../utils/qrToken';
import { endpoints } from '../../endpoint';

// GET /api/checkout/token?sessionId=xxx
// Returns a signed checkout token for the session.
// The bill page uses this to generate the exit QR code the supervisor scans at the door.
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ message: 'sessionId is required' }, { status: 400 });
    }

    const session = await Session.findOne({ sessionId, status: 'active' });
    if (!session) {
      return NextResponse.json({ message: 'Session not found or inactive' }, { status: 404 });
    }

    const token = generateCheckoutToken(sessionId);
    const checkoutUrl = `http://${endpoints.next_ip_port}/door?token=${token}`;

    return NextResponse.json({ token, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error('[CheckoutToken] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
