import { NextResponse } from "next/server";
import connectToDatabase from "../../models/Connection";
import { Orders } from "../../models/Order";

export async function PUT(req: Request) {
    try {
        await connectToDatabase();

        // Extract the session ID and order IDs from the request
        const { sessionId } = await req.json();
        const url = new URL(req.url);
        const orderIds = url.searchParams.get('orderIds')?.split(',');

        // Check if required fields are present
        if (!sessionId || !orderIds || orderIds.length === 0) {
            return NextResponse.json(
                { message: 'Missing sessionId or orderIds' },
                { status: 400 }
            );
        }

        // Find all orders matching the provided order IDs
        const orders = await Orders.find({
            orderId: { $in: orderIds }
        });

        // Check if all orders were found
        if (orders.length !== orderIds.length) {
            return NextResponse.json(
                { message: 'One or more orders not found' },
                { status: 404 }
            );
        }

        // Verify session ID matches for all orders
        const invalidSessionOrders = orders.filter(
            order => order.sessionId !== sessionId
        );

        if (invalidSessionOrders.length > 0) {
            return NextResponse.json(
                { message: 'Unauthorized: sessionId mismatch for one or more orders' },
                { status: 403 }
            );
        }

        // Verify that all orders are unpaid
        const alreadyPaidOrders = orders.filter(
            order => order.payment === 'paid'
        );

        if (alreadyPaidOrders.length > 0) {
            return NextResponse.json(
                { message: 'One or more orders are already paid' },
                { status: 400 }
            );
        }

        // Verify that all orders are in 'served' status
        const unservedOrders = orders.filter(
            order => order.status !== 'served'
        );

        if (unservedOrders.length > 0) {
            return NextResponse.json(
                { message: 'One or more orders have not been served yet' },
                { status: 400 }
            );
        }

        // Update payment status for all orders
        const updatePromises = orders.map(order => {
            order.payment = 'wantToPay';
            order.paidAt = new Date();
            return order.save();
        });

        await Promise.all(updatePromises);

        return NextResponse.json(
            {
                message: 'Payment status updated successfully',
                updatedOrders: orders
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating payment status:', error);
        return NextResponse.json(
            { message: 'Error updating payment status' },
            { status: 500 }
        );
    }
}