import { NextResponse } from 'next/server';
import connectToDatabase from '../../../models/Connection';
import { Orders } from '../../../models/Order';

// GET /api/admin/payments/overview
// Returns all paid + wantToPay orders with calculated totals.
// Supports optional ?since=ISO_DATE and ?until=ISO_DATE query params.
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const until = searchParams.get('until');

    const filter: Record<string, unknown> = {
      payment: { $in: ['paid', 'wantToPay'] },
    };

    if (since || until) {
      const dateFilter: Record<string, Date> = {};
      if (since) dateFilter.$gte = new Date(since);
      if (until) dateFilter.$lte = new Date(until);
      filter['timestamps.orderedAt'] = dateFilter;
    }

    const orders = await Orders.find(filter)
      .sort({ 'timestamps.orderedAt': -1 })
      .lean() as unknown as Array<{
        orderId: number;
        sessionId: string;
        tableNumber: string;
        guestName?: string;
        seatNumber?: string;
        foodItems: Array<{ price: number; quantity: number; name: string; category: string }>;
        payment: string;
        paymentMethod?: string;
        timestamps?: { orderedAt?: Date };
      }>;

    const enriched = orders.map((order) => {
      const total = order.foodItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return {
        orderId: order.orderId,
        sessionId: order.sessionId,
        tableNumber: order.tableNumber,
        seatNumber: order.seatNumber || '',
        guestName: order.guestName || '',
        itemCount: order.foodItems.length,
        total: parseFloat(total.toFixed(2)),
        payment: order.payment,
        paymentMethod: order.paymentMethod || '',
        orderedAt: order.timestamps?.orderedAt || null,
      };
    });

    const grandTotal = enriched.reduce((sum, o) => sum + o.total, 0);
    const paidTotal = enriched
      .filter((o) => o.payment === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      orders: enriched,
      summary: {
        totalOrders: enriched.length,
        paidOrders: enriched.filter((o) => o.payment === 'paid').length,
        pendingOrders: enriched.filter((o) => o.payment === 'wantToPay').length,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        paidTotal: parseFloat(paidTotal.toFixed(2)),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[PaymentsOverview] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
