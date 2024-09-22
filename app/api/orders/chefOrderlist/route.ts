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
            // No id provided, fetch all orders with 'ordered' status
            result = await Orders.find({ status: { $in: ['ordered', 'preparing'] } })
        }
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Error fetching orders' }, { status: 500 });
    }
}