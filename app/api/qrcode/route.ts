import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const reqUrl = new URL(request.url);
    const { searchParams } = reqUrl;
    const tableNumber = searchParams.get('tableNumber');
    const seatsParam  = searchParams.get('seats');

    if (!tableNumber || !tableNumber.trim()) {
      return NextResponse.json(
        { message: 'Missing tableNumber parameter' },
        { status: 400 }
      );
    }

    const seatCount = parseInt(seatsParam || '2', 10);
    if (isNaN(seatCount) || seatCount < 1 || seatCount > 20) {
      return NextResponse.json(
        { message: 'seats must be a number between 1 and 20' },
        { status: 400 }
      );
    }

    const hostOverride = searchParams.get('host');
    const baseUrl = hostOverride
      ? (hostOverride.startsWith('http') ? hostOverride : `http://${hostOverride}`)
      : (process.env.APP_BASE_URL ?? `${reqUrl.protocol}//${reqUrl.host}`);

    // One QR code per seat — each points to /customer/[tableNumber]
    // Seat number is auto-assigned server-side when the customer scans.
    const seats = Array.from({ length: seatCount }, (_, i) => {
      const seat = `C${i + 1}`;
      const url = `${baseUrl}/customer/${encodeURIComponent(tableNumber)}`;
      return { seat, url };
    });

    return NextResponse.json({ table: tableNumber, seats }, { status: 200 });
  } catch (error) {
    console.error('Error generating QR codes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
