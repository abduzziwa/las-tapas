import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { Orders } from '../../models/Order';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // Get the URL from the request
        const url = new URL(req.url);
        const sessionId = url.searchParams.get('sessionId');
        // const sessionId = "s2"
        if (!sessionId) {
            return NextResponse.json({ message: 'SessionId is required' }, { status: 400 });
        }

        // Find orders with the provided sessionId and status 'ordered' or 'served'
        const result = await Orders.aggregate([
            {
                $match: {
                    sessionId: sessionId,
                    status: { $in: ['ordered', 'served', 'preparing', 'ready'] }
                }
            },
            {
                $addFields: {
                    sortOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$status', 'ordered'] }, then: 0 },
                                { case: { $eq: ['$status', 'served'] }, then: 1 },
                                
                            ],
                            default: 2
                        }
                    }
                }
            },
            {
                $sort: { sortOrder: 1 }
            },
            {
                $project: {
                    orderId: 1,
                    sessionId: 1,
                    tableNumber: 1,
                    foodItems: 1,
                    status: 1,
                    timestamps: 1,
                    payment: 1,
                    _id: 0 // Exclude the _id field from the result
                }
            }
        ]);

        if (result.length === 0) {
            return NextResponse.json({ message: 'No orders Yet', session: sessionId }, { status: 404 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Error fetching orders' }, { status: 500 });
    }
}