import { NextResponse } from "next/server";
import connectToDatabase from "../../models/Connection";
import { Menu } from "../../models/menuItem";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const result = await Menu.find({ category: 'drink' })
        console.log("Menu Requested: " +  Date.now())
        const response = NextResponse.json(result, { status: 200 });

        response.headers.set('Access-Control-Allow-Origin', '*'); // Allows all origins
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers

        return response;

    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
    }
}