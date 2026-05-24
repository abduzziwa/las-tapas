import { NextResponse } from "next/server";
import connectToDatabase from "../../models/Connection";
import { Orders } from "../../models/Order";
import { Employees } from "../../models/employees";
import { log } from "../../utils/auditLogger";
import type { AuditEventType } from "../../models/AuditLog";

export async function PUT(req: Request) {
  try {
    await connectToDatabase();

    const { orderId, status, sessionId, employeeId, employeeName } = await req.json();

    if (!orderId || !status || (!sessionId && !employeeId)) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const validStatuses = ['notYetOrdered', 'preparing', 'ready', 'served'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    const order = await Orders.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (!employeeId && order.sessionId !== sessionId) {
      return NextResponse.json({ message: 'Unauthorized: sessionId mismatch' }, { status: 403 });
    }

    const prevStatus = order.status;
    order.status = status;
    await order.save();

    // Use name from request if provided; fall back to DB lookup
    let actorName: string | undefined = employeeName || undefined;
    if (employeeId && !actorName) {
      const emp = await Employees.findOne({ employeeId }, { name: 1 }).lean() as { name?: string } | null;
      actorName = emp?.name;
    }

    const statusEventMap: Partial<Record<string, AuditEventType>> = {
      preparing: 'order.status.preparing',
      ready:     'order.status.ready',
      served:    'order.status.served',
    };
    const eventType = statusEventMap[status];
    if (eventType) {
      log({
        eventType,
        orderId: String(orderId),
        tableNumber: order.tableNumber,
        sessionId: order.sessionId,
        actor: {
          type: employeeId ? 'waiter' : 'customer',
          id: employeeId || sessionId,
          name: actorName,
        },
        details: { from: prevStatus, to: status },
      });
    }

    return NextResponse.json({ message: 'Order status updated successfully', order }, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ message: 'Error updating order status' }, { status: 500 });
  }
}
