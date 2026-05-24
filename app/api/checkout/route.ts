import { NextResponse } from "next/server";
import connectToDatabase from "../models/Connection";
import { Session } from "../models/session";
import { Tables } from "../models/Tables";
import { Orders } from "../models/Order";
import { PaymentConfig } from "../models/PaymentConfig";
import { verifyCheckoutToken, generateCheckoutToken } from "../utils/qrToken";
import { createTikkiePaymentRequest } from "../utils/tikkie";
import { log } from "../utils/auditLogger";

// GET /api/checkout?token=xxx
// Called when supervisor scans customer's phone QR at door.
// Marks the session inactive and removes it from the table's seat list.
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Missing checkout token" },
        { status: 400 },
      );
    }

    const sessionId = verifyCheckoutToken(token);
    if (!sessionId) {
      return NextResponse.json(
        { message: "Invalid or tampered checkout token" },
        { status: 403 },
      );
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 },
      );
    }

    if (session.status === "inactive") {
      return NextResponse.json(
        { message: "Session already checked out", alreadyDone: true },
        { status: 200 },
      );
    }

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
    }

    log({
      eventType: "session.checkout",
      sessionId,
      tableNumber,
      actor: { type: "system", id: "door-scan" },
    });

    if (table && table.occupiedBy.length === 0) {
      log({ eventType: "table.freed", tableNumber, sessionId });
    }

    return NextResponse.json(
      {
        message: "Checkout confirmed",
        sessionId,
        tableNumber,
        tableFreed: table ? table.occupiedBy.length === 0 : false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/checkout — initiate Tikkie payment
// Body: { sessionId }
// Returns: { url, demo } where url is the Tikkie payment link
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { message: "sessionId is required" },
        { status: 400 },
      );
    }

    const session = await Session.findOne({ sessionId, status: "active" });
    if (!session) {
      return NextResponse.json(
        { message: "Session not found or inactive" },
        { status: 404 },
      );
    }

    // Get all unpaid/wantToPay orders for this session
    const orders = await Orders.find({
      sessionId,
      payment: { $in: ["unpaid", "wantToPay"] },
    }).lean();

    if (orders.length === 0) {
      return NextResponse.json(
        { message: "No outstanding orders found" },
        { status: 400 },
      );
    }

    const totalCents = Math.round(
      orders.reduce((sum, order) => {
        const orderTotal = order.foodItems.reduce(
          (s: number, item: { price: number; quantity: number }) =>
            s + item.price * item.quantity,
          0,
        );
        return sum + orderTotal;
      }, 0) * 100,
    );

    const config = (await PaymentConfig.findOne({
      configId: "singleton",
    }).lean()) as {
      tikkieApiKey?: string;
      tikkieAppToken?: string;
    } | null;

    const guestLabel = session.guestName || `Table ${session.lastActiveTable}`;
    const result = await createTikkiePaymentRequest({
      amountInCents: totalCents,
      description: `Las Tapas — ${guestLabel}`,
      merchantPaymentId: sessionId,
      apiKey: config?.tikkieApiKey || "",
      appToken: config?.tikkieAppToken || "",
    });

    if (!result) {
      return NextResponse.json(
        { message: "Failed to create Tikkie payment request" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        url: result.url,
        paymentRequestToken: result.paymentRequestToken,
        amountCents: totalCents,
        demo: result.demo,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Checkout/Tikkie] Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
