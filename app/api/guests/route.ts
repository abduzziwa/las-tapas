import { NextResponse } from "next/server";
import connectToDatabase from "../models/Connection";
import { Session } from "../models/session";
import { Orders } from "../models/Order";

// GET /api/guests — all active guests with names and order counts for waiter profiles panel
export async function GET() {
  try {
    await connectToDatabase();

    const activeSessions = await Session.find({ status: "active" }).lean();

    const guests = await Promise.all(
      activeSessions.map(async (session) => {
        const orderCount = await Orders.countDocuments({
          sessionId: session.sessionId,
        });
        const latestOrder = (await Orders.findOne(
          { sessionId: session.sessionId },
          { status: 1, payment: 1 },
          { sort: { "timestamps.orderedAt": -1 } },
        ).lean()) as { status?: string; payment?: string } | null;

        return {
          sessionId: session.sessionId,
          guestName: session.guestName || "",
          tableNumber: session.lastActiveTable,
          seatNumber: session.seatNumber,
          orderCount,
          latestStatus: latestOrder?.status ?? null,
          latestPayment: latestOrder?.payment ?? null,
          joinedAt: session.createdAt,
        };
      }),
    );

    // Sort by table then seat for a clean display
    guests.sort((a, b) => {
      if (a.tableNumber !== b.tableNumber)
        return a.tableNumber.localeCompare(b.tableNumber);
      return a.seatNumber.localeCompare(b.seatNumber);
    });

    return NextResponse.json(guests, { status: 200 });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
