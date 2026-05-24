import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { Tables } from '../../models/Tables';
import { Session } from '../../models/session';

export const dynamic = 'force-dynamic';

export interface SeatInfo {
  seatNumber: string;
  occupied: boolean;
  guestName: string | null;
}

// GET /api/tables/seats?tableNumber=T1
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tableNumber = searchParams.get('tableNumber');

    if (!tableNumber) {
      return NextResponse.json({ message: 'tableNumber is required' }, { status: 400 });
    }

    const table = await Tables.findOne({ tableNumber }).lean() as { seats: number } | null;
    if (!table) {
      return NextResponse.json({ message: 'Table not found' }, { status: 404 });
    }

    const activeSessions = await Session.find({
      lastActiveTable: tableNumber,
      status: 'active',
    }).select('seatNumber guestName').lean() as unknown as { seatNumber: string; guestName: string }[];

    const occupiedMap = new Map(activeSessions.map(s => [s.seatNumber, s.guestName || null]));

    const seats: SeatInfo[] = Array.from({ length: table.seats }, (_, i) => {
      const seatNumber = `C${i + 1}`;
      const occupied = occupiedMap.has(seatNumber);
      return { seatNumber, occupied, guestName: occupied ? (occupiedMap.get(seatNumber) ?? null) : null };
    });

    return NextResponse.json({ tableNumber, seats });
  } catch (error) {
    console.error('[tables/seats] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
