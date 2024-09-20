import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import { Menu } from '../models/menuItem';


export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const result = await Menu.find()
        // console.log("Menu Requested: " +  Date.now())
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
    }
}