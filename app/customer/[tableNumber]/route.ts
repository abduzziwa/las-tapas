import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "../../api/models/Connection";
import { Session } from "../../api/models/session";
import { Tables } from "../../api/models/Tables";
import { log } from "../../api/utils/auditLogger";

export async function GET(
  request: Request,
  { params }: { params: { tableNumber: string } }
) {
  try {
    await connectToDatabase();

    const { tableNumber } = params;

    if (!tableNumber?.trim()) {
      return NextResponse.json({ message: "Missing table number" }, { status: 400 });
    }

    const table = await Tables.findOne({ tableNumber });
    if (!table) {
      return NextResponse.json({ message: "Table not found" }, { status: 404 });
    }

    // Auto-assign seat number based on how many sessions are already active
    const activeSessions = table.occupiedBy?.length ?? 0;
    const seatNumber = `C${activeSessions + 1}`;

    const sessionId = `s${crypto.randomBytes(8).toString("hex")}`;
    await new Session({
      sessionId,
      seatNumber,
      lastActiveTable: tableNumber,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      status: "active",
    }).save();

    table.status = "occupied";
    table.occupiedBy.push(sessionId);
    await table.save();

    log({ eventType: "session.started", sessionId, tableNumber, details: { note: seatNumber } });
    log({ eventType: "table.occupied", tableNumber, sessionId });

    const reqUrl = new URL(request.url);
    const host = request.headers.get('host') ?? reqUrl.host;
    const baseUrl = process.env.APP_BASE_URL ?? `${reqUrl.protocol}//${host}`;
    const redirectUrl = new URL("/", baseUrl);
    redirectUrl.searchParams.set("sessionId", sessionId);
    redirectUrl.searchParams.set("tableNumber", tableNumber);
    redirectUrl.searchParams.set("seatNumber", seatNumber);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24,
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error processing customer scan:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
