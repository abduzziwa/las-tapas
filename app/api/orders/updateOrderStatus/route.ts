import { NextResponse } from "next/server";
import connectToDatabase from "../../models/Connection";
import { Orders } from "../../models/Order";


export async function PUT(req: Request) {
    try {
        await connectToDatabase();

        // Parse the request body for the data
        const { orderId, status, sessionId } = await req.json();

        // Check if all required fields are present
        if (!orderId || !status || !sessionId) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Validate the status value
        const validStatuses = ['notYetOrdered', 'preparing', 'ready', 'delivered'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
        }

        // Find the order by orderId
        const order = await Orders.findOne({ orderId });

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Verify that the sessionId matches the sessionId of the order
        if (order.sessionId !== sessionId) {
            return NextResponse.json({ message: 'Unauthorized: sessionId mismatch' }, { status: 403 });
        }

        // Update the status of the order
        order.status = status;
        await order.save();

        return NextResponse.json({ message: 'Order status updated successfully', order }, { status: 200 });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ message: 'Error updating order status' }, { status: 500 });
    }
}
