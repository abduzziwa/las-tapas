import connectToDatabase from "../models/Connection";
import { NextResponse } from "next/server";
import { Tables } from "../models/Tables";

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

export async function POST(req: Request) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse the request body to extract the table information
        const { tableNumber, seats, status, occupiedBy } = await req.json();

        // Validate the input
        if (!tableNumber || !seats || !status || !occupiedBy) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Attempt to add the new table to the database
        const newTable = await Tables.create({
            tableNumber: tableNumber,
            seats: seats,
            status: status,
            occupiedBy: occupiedBy
        });

        // Return a success response
        return NextResponse.json({ message: 'Table added successfully', table: newTable }, { status: 201 });
    } catch (error) {
        console.error('Error adding table:', error);
        return NextResponse.json({ message: 'Error adding table' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse the request body to extract the table information
        const { _id, tableNumber, seats, status, occupiedBy } = await req.json();

        // Validate the input
        if (!_id || !tableNumber || !seats || !status || !occupiedBy) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Attempt to find the table by _id and update it
        const updatedTable = await Tables.findByIdAndUpdate(
            _id,
            {
                tableNumber: tableNumber,
                seats: seats,
                status: status,
                occupiedBy: occupiedBy
            },
            { new: true } // Option to return the updated document
        );

        // Check if the table was found and updated
        if (!updatedTable) {
            return NextResponse.json({ message: 'Table not found' }, { status: 404 });
        }

        // Return a success response with the updated table data
        return NextResponse.json({ message: 'Table updated successfully', table: updatedTable }, { status: 200 });
    } catch (error) {
        console.error('Error updating table:', error);
        return NextResponse.json({ message: 'Error updating table' }, { status: 500 });
    }
}
