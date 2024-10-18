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

export async function DELETE(req: Request) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse the URL to extract the query parameter
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('id');

        if (!itemId) {
            return NextResponse.json({ message: 'Item ID is required' }, { status: 400 });
        }

        // Attempt to delete the item from the database
        const result = await Menu.findOneAndDelete({foodId: itemId });

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
