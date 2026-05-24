import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { Orders } from '../../models/Order';
import { Tables } from '../../models/Tables';
import { Session } from '../../models/session';
import { log } from '../../utils/auditLogger';

interface StaffOrderItem {
  foodId: string;
  name: string;
  quantity: number;
  price: number;
  category: 'food' | 'drink' | 'dessert';
  modification?: string;
}

// POST /api/orders/staffOrder
// Used by waiter/bar staff to place orders on behalf of guests or walkins.
// Body: { employeeId, tableNumber, sessionId?, guestName?, items[] }
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { employeeId, tableNumber, sessionId, guestName, items } = body as {
      employeeId: string;
      tableNumber: string;
      sessionId?: string;
      guestName?: string;
      items: StaffOrderItem[];
    };

    if (!employeeId) {
      return NextResponse.json({ message: 'employeeId is required' }, { status: 401 });
    }
    if (!tableNumber) {
      return NextResponse.json({ message: 'tableNumber is required' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'items must be a non-empty array' }, { status: 400 });
    }
    for (const item of items) {
      if (!item.foodId || !item.name || !item.quantity || item.price == null || !item.category) {
        return NextResponse.json({ message: 'Each item must have foodId, name, quantity, price, category' }, { status: 400 });
      }
    }

    // Resolve sessionId — use provided, or pick the first active session at the table,
    // or synthesize a staff walkup session.
    let resolvedSession = sessionId;

    if (!resolvedSession) {
      const table = await Tables.findOne({ tableNumber }).lean() as { occupiedBy?: string[] } | null;
      if (table?.occupiedBy && table.occupiedBy.length > 0) {
        resolvedSession = table.occupiedBy[0];
      }
    }

    if (!resolvedSession) {
      // Walkup: create a lightweight staff-initiated session record
      const walkupId = `walkup_${tableNumber}_${Date.now()}`;
      await Session.create({
        sessionId: walkupId,
        lastActiveTable: tableNumber,
        seatNumber: 'S0',
        guestName: guestName?.trim().slice(0, 50) || 'Walkup',
        status: 'active',
      });
      resolvedSession = walkupId;
    }

    // Determine next orderId
    const latest = await Orders.findOne({}, { orderId: 1 }).sort({ orderId: -1 });
    const nextId = latest ? Number(latest.orderId) + 1 : 1;
    const paddedId = String(nextId).padStart(4, '0');

    const newOrder = new Orders({
      orderId: paddedId,
      employeeId,
      sessionId: resolvedSession,
      tableNumber,
      guestName: guestName?.trim().slice(0, 50) || '',
      foodItems: items.map((i) => ({
        foodId: i.foodId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        category: i.category,
        modification: i.modification?.trim() ?? '',
      })),
      status: 'ordered',
      payment: 'unpaid',
      timestamps: { orderedAt: new Date() },
    });

    await newOrder.save();

    log({
      eventType: 'order.created',
      orderId: paddedId,
      tableNumber,
      sessionId: resolvedSession,
      actor: { type: 'waiter', id: String(employeeId) },
      details: { itemCount: items.length, staffInitiated: true },
    });

    return NextResponse.json({ orderId: paddedId, sessionId: resolvedSession }, { status: 201 });
  } catch (error) {
    console.error('[staffOrder] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
