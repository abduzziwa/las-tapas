// import { NextResponse } from "next/server";
// import { cookies } from 'next/headers';
// import crypto from 'crypto';
// import connectToDatabase from "../models/Connection";
// import { Session } from "../models/session";
// import { Tables } from "../models/tables";
// import { endpoints } from "../endpoint";

// export async function GET(request: Request) {
//   try {
//     // Connect to the database
//     await connectToDatabase();
//     console.log('Database connection successful');

//     // Extract table number from the URL
//     const { searchParams } = new URL(request.url);
//     const tableNumber = searchParams.get('tableNumber');

//     if (!tableNumber || !/^T\d+$/.test(tableNumber)) {
//       console.error('Invalid table number:', tableNumber);
//       return NextResponse.json({ message: 'Invalid table number' }, { status: 400 });
//     }

//     console.log('Table number:', tableNumber);

//     // Check if the table exists and is available
//     const table = await Tables.findOne({ tableNumber });
//     console.log('Fetched Table from DB:', table);

//     if (!table) {
//       console.error('Table not found for table number:', tableNumber);
//       return NextResponse.json({ message: 'Table not found' }, { status: 404 });
//     }

//     if (table.status !== 'available') {
//       console.warn('Table is not available:', table.status);
//       return NextResponse.json({ message: 'Table is not available' }, { status: 400 });
//     }

//     // Generate or retrieve sessionId
//     const cookieStore = cookies();
//     let sessionId = cookieStore.get('sessionId')?.value;
//     let session;

//     if (!sessionId) {
//       // Create a new session
//       sessionId = `s${crypto.randomBytes(8).toString('hex')}`;
//       session = new Session({
//         sessionId,
//         lastActiveTable: tableNumber,
//         createdAt: new Date(),
//         lastActiveAt: new Date(),
//         status: 'active'
//       });

//       console.log('Creating new session:', session);
//       await session.save();
//     } else {
//       // Update existing session
//       session = await Session.findOne({ sessionId });
//       console.log('Retrieved session from DB:', session);

//       if (!session) {
//         console.error('Invalid session:', sessionId);
//         return NextResponse.json({ message: 'Invalid session' }, { status: 400 });
//       }

//       session.lastActiveTable = tableNumber;
//       session.lastActiveAt = new Date();
//       await session.save();
//       console.log('Updated existing session:', session);
//     }

//     // Update table status
//     table.status = 'occupied';
//     table.occupiedBy = sessionId;
//     await table.save();
//     console.log('Updated table status to occupied:', table);

//     // Create response with redirect
//     const redirectUrl = new URL('/', request.url);

//     // Append session and table data as query parameters
//     redirectUrl.searchParams.append('sessionId', sessionId);
//     redirectUrl.searchParams.append('tableNumber', tableNumber);

//     const response = NextResponse.redirect(redirectUrl);

//     // Set cookies
//     response.cookies.set('sessionId', sessionId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV !== 'development',
//       maxAge: 60 * 60 * 24, // 24 hours
//       sameSite: 'strict',
//       path: endpoints.next_home,
//     });

//     console.log('Cookies set, redirecting to home page...');
//     return response;
//   } catch (error) {
//     console.error('Error processing QR code:', error);
//     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "../models/Connection";
import { Session } from "../models/session";
import { Tables } from "../models/Tables";
import { verifyQRToken } from "../utils/qrToken";
import { log } from "../utils/auditLogger";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Missing QR token" },
        { status: 400 },
      );
    }

    // Decode and verify — returns null if forged or tampered
    const decoded = verifyQRToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid or tampered QR code" },
        { status: 403 },
      );
    }

    const { tableNumber, seatNumber } = decoded;

    const table = await Tables.findOne({ tableNumber });
    if (!table) {
      return NextResponse.json({ message: "Table not found" }, { status: 404 });
    }

    // Reject if this seat already has an active session
    const existing = await Session.findOne({ lastActiveTable: tableNumber, seatNumber, status: "active" }).lean();
    if (existing) {
      return NextResponse.json(
        { message: `Seat ${seatNumber} is already occupied. Please ask a staff member for help.` },
        { status: 409 },
      );
    }

    // Each QR scan creates a fresh session — one per person per seat
    const sessionId = `s${crypto.randomBytes(8).toString("hex")}`;
    await new Session({
      sessionId,
      seatNumber,
      lastActiveTable: tableNumber,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      status: "active",
    }).save();

    // Add this session to the table's seat list without removing others
    table.status = "occupied";
    table.occupiedBy.push(sessionId);
    await table.save();

    const reqUrl = new URL(request.url);
    const host = request.headers.get('host') ?? reqUrl.host;
    const baseUrl = process.env.APP_BASE_URL ?? `${reqUrl.protocol}//${host}`;
    const redirectUrl = new URL("/", baseUrl);
    redirectUrl.searchParams.append("sessionId", sessionId);
    redirectUrl.searchParams.append("tableNumber", tableNumber);
    redirectUrl.searchParams.append("seatNumber", seatNumber);

    log({
      eventType: "session.started",
      sessionId,
      tableNumber,
      details: { note: seatNumber },
    });
    log({ eventType: "table.occupied", tableNumber, sessionId });

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
    console.error("Error processing QR scan:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
