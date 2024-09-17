import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import { Orders } from '../models/Order';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // Get the URL from the request
        const url = new URL(req.url);
        
        // Check if there's an 'id' parameter
        const id = url.searchParams.get('id');

        let result;
        if (id) {
            // order met een een bepaald id
            result = await Orders.findById({}, { id});
            if (!result) {
                return NextResponse.json({ message: 'Order not found' }, { status: 404 });
            }
        } else {
            // Geen id ( Alle data)
            result = await Orders.find();
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Error fetching orders' }, { status: 500 });
    }
}