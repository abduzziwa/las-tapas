import { NextResponse } from "next/server"; // Assuming you have a Session model
import { cookies } from 'next/headers'
import crypto from 'crypto';
import connectToDatabase from "../models/Connection";
import { Session } from "../models/session";

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        const { pathname } = new URL(req.url);
        const slug = pathname.split('/').pop();

        if (slug && slug.startsWith('T') && /^T\d+$/.test(slug)) {
            const tableNumber = slug;
            const cookieStore = cookies()
            const deviceId = cookieStore.get('deviceId')?.value || crypto.randomBytes(16).toString('hex');
            let sessionId = cookieStore.get('sessionId')?.value;

            let session;
            let isNewSession = false;

            if (sessionId) {
                // Check if the session exists in the database
                session = await Session.findOne({ sessionId });
            }

            if (!session) {
                // Create a new session
                isNewSession = true;
                sessionId = `s${crypto.randomBytes(8).toString('hex')}`;
                session = new Session({
                    sessionId,
                    deviceId,
                    lastActiveTable: tableNumber,
                    createdAt: new Date(),
                    lastActiveAt: new Date(),
                    status: 'active'
                });
                await session.save();
            } else {
                // Update existing session
                session.lastActiveTable = tableNumber;
                session.lastActiveAt = new Date();
                await session.save();
                sessionId = session.sessionId; // Ensure sessionId is set
            }

            // Prepare the response with redirection
            const response = NextResponse.redirect(new URL('/', req.url));
            
            if ( sessionId ) {
                response.cookies.set('sessionId', sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    sameSite: 'strict',
                    path: '/',
                });
            }
            // Set cookies
            response.cookies.set('deviceId', deviceId, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60 * 24 * 365, // 1 year
                sameSite: 'strict',
                path: '/',
            });

            // You can add a query parameter to indicate it's a new session if needed
            if (isNewSession) {
                response.cookies.set('isNewSession', 'true', {
                    maxAge: 60, // This cookie will expire in 60 seconds
                    path: '/',
                });
            }

            return response;
        } else {
            // Handle invalid requests
            return NextResponse.json({ error: 'Invalid QR code' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error handling table QR code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}