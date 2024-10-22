import connectToDatabase from "../models/Connection";
import { NextResponse } from "next/server";
import { Tables } from "../models/tables";

export async function GET(){
    try {
        await connectToDatabase()
        const result = await Tables.find()
        return NextResponse.json( result, { status: 200})
        
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse the URL to extract the query parameter
        const { searchParams } = new URL(req.url);
        const tableNumber = searchParams.get('tableNumber');

        if (!tableNumber) {
            return NextResponse.json({ message: 'Table Number is required' }, { status: 400 });
        }

        // Attempt to delete the item from the database
        const result = await Tables.findOneAndDelete({tableNumber: tableNumber });

        // Check if the item was found and deleted
        if (!result) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        // Return a success response
        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json({ message: 'Error deleting menu item' }, { status: 500 });
    }
}

