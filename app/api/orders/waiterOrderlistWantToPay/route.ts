import { NextResponse } from 'next/server';
import { Orders } from '../../models/Order';
import connectToDatabase from '../../models/Connection';

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        
        // Get the URL from the request
        const url = new URL(req.url);
        const orderId = url.searchParams.get('orderId');
        
        let result;
        if (orderId) {
            // Find order with a specific id
            result = await Orders.findById(orderId);
            if (!result) {
                return NextResponse.json({ message: 'Order not found' }, { status: 404 });
            }
        } else {
            // No id provided, fetch all orders with 'served' status and 'wantToPay' payment
            result = await Orders.find({ status: { $in: ['served'] }, payment: { $in: ['wantToPay']} });
        }
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Error fetching orders' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectToDatabase();

        // Get the URL and orderId from the request
        const url = new URL(req.url);
        const orderId = url.searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
        }

        // Parse the request body
        const body = await req.json();
        const { sessionId, paymentStatus } = body;

        // Validate required fields
        if (!sessionId || !paymentStatus) {
            return NextResponse.json({ 
                message: 'Session ID and payment status are required' 
            }, { status: 400 });
        }

        // Find and update the order
        const updatedOrder = await Orders.findOneAndUpdate(
            { orderId: orderId },
            { payment: paymentStatus },
            { new: true } // Returns the updated document
        );

        if (!updatedOrder) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(updatedOrder, { status: 200 });
    } catch (error) {
        console.error('Error updating order payment status:', error);
        return NextResponse.json({ 
            message: 'Error updating order payment status' 
        }, { status: 500 });
    }
}