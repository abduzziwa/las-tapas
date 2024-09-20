import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { Orders } from '../../models/Order';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const {
            sessionId,
            tableNumber,
            foodItems,
            status,
        } = await req.json();

        if (!sessionId || !tableNumber || !foodItems || !status) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        if (status !== 'notYetOrdered') {
            return NextResponse.json({ message: 'Invalid initial status' }, { status: 400 });
        }

        const lastOrder = await Orders.findOne().sort({ orderId: -1 }).limit(1);
        const newOrderId = lastOrder ? `o${parseInt(lastOrder.orderId.slice(1)) + 1}` : 'o3';

        const newOrder = new Orders({
            _id: new mongoose.Types.ObjectId(), // Explicitly add _id
            orderId: newOrderId,
            sessionId,
            tableNumber,
            foodItems,
            status: 'notYetOrdered',
        });

        newOrder.status = 'ordered';

        await newOrder.save();

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Detailed error:', error);
        return NextResponse.json({ 
            message: 'Error creating order', 
            error: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}