import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { AuditLog } from '../../models/AuditLog';

// GET /api/admin/auditlog
// Returns recent audit log entries, newest first.
// Query params:
//   limit      — number of entries (default 100, max 500)
//   eventType  — filter by event type
//   tableNumber— filter by table
//   sessionId  — filter by session
//   since      — ISO date: only events after this timestamp
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
    const eventType = searchParams.get('eventType');
    const tableNumber = searchParams.get('tableNumber');
    const sessionId = searchParams.get('sessionId');
    const since = searchParams.get('since');

    const filter: Record<string, unknown> = {};
    if (eventType) filter.eventType = eventType;
    if (tableNumber) filter.tableNumber = tableNumber;
    if (sessionId) filter.sessionId = sessionId;
    if (since) filter.timestamp = { $gt: new Date(since) };

    const entries = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('[AuditLog GET] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
