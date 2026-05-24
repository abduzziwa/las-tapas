import { NextResponse } from "next/server";
import connectToDatabase from "../../models/Connection";
import { Orders } from "../../models/Order";
import { Session } from "../../models/session";
import { Tables } from "../../models/Tables";
import { log } from "../../utils/auditLogger";

// POST /api/tikkie/webhook
// Called by ABN AMRO Tikkie when a payment is confirmed.
// The merchantPaymentId we set when creating the payment request equals the sessionId,
// so we can match the webhook back to the right session and orders.
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Tikkie sends: { paymentRequestToken, merchantPaymentId, amountInCents, ... }
    const sessionId: string = body.merchantPaymentId;
    const amountInCents: number = body.amountInCents || 0;

    if (!sessionId) {
      console.error("[TikkieWebhook] Missing merchantPaymentId in payload");
      return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    }

    // Mark all outstanding orders for this session as paid via Tikkie
    const orders = await Orders.find({
      sessionId,
      payment: { $in: ["unpaid", "wantToPay"] },
    });

    if (orders.length === 0) {
      // Could be a duplicate webhook — idempotent response
      return NextResponse.json(
        { message: "No outstanding orders" },
        { status: 200 },
      );
    }

    await Orders.updateMany(
      { sessionId, payment: { $in: ["unpaid", "wantToPay"] } },
      { $set: { payment: "paid", paymentMethod: "tikkie" } },
    );

    // Mark session inactive and free the table seat
    const session = await Session.findOne({ sessionId });
    if (session) {
      const tableNumber = session.lastActiveTable;
      session.status = "inactive";
      await session.save();

      const table = await Tables.findOne({ tableNumber });
      if (table) {
        table.occupiedBy = table.occupiedBy.filter(
          (id: string) => id !== sessionId,
        );
        if (table.occupiedBy.length === 0) {
          table.status = "available";
        }
        await table.save();

        if (table.occupiedBy.length === 0) {
          log({ eventType: "table.freed", tableNumber, sessionId });
        }
      }

      orders.forEach((order) => {
        log({
          eventType: "order.payment.paid",
          orderId: String(order.orderId),
          tableNumber: order.tableNumber,
          sessionId,
          actor: { type: "system", id: "tikkie-webhook" },
          details: { paymentMethod: "tikkie", amount: amountInCents },
        });
      });

      log({
        eventType: "session.checkout",
        sessionId,
        tableNumber,
        actor: { type: "system", id: "tikkie-webhook" },
        details: { paymentMethod: "tikkie", amount: amountInCents },
      });
    }

    return NextResponse.json({ message: "Payment recorded" }, { status: 200 });
  } catch (error) {
    console.error("[TikkieWebhook] Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
