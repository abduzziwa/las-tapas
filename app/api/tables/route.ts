import connectToDatabase from "../models/Connection";
import { NextResponse } from "next/server";
import { Tables } from "../models/Tables";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const result = await Tables.find();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ message: 'Error fetching tables' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { tableNumber, seats, status } = await req.json();

    if (!tableNumber || !seats) {
      return NextResponse.json({ message: 'tableNumber and seats are required' }, { status: 400 });
    }

    const newTable = await Tables.create({
      tableNumber,
      seats: Number(seats),
      status: status || 'available',
      occupiedBy: [],
    });

    return NextResponse.json({ message: 'Table added successfully', table: newTable }, { status: 201 });
  } catch (error) {
    console.error('Error adding table:', error);
    return NextResponse.json({ message: 'Error adding table' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get('tableNumber');

    if (!tableNumber) {
      return NextResponse.json({ message: 'tableNumber query param is required' }, { status: 400 });
    }

    const body = await req.json();

    const updatedTable = await Tables.findOneAndUpdate(
      { tableNumber },
      {
        ...(body.seats !== undefined && { seats: Number(body.seats) }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.occupiedBy !== undefined && { occupiedBy: body.occupiedBy }),
      },
      { new: true }
    );

    if (!updatedTable) {
      return NextResponse.json({ message: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Table updated successfully', table: updatedTable }, { status: 200 });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ message: 'Error updating table' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get('tableNumber');

    if (!tableNumber) {
      return NextResponse.json({ message: 'tableNumber is required' }, { status: 400 });
    }

    const result = await Tables.findOneAndDelete({ tableNumber });

    if (!result) {
      return NextResponse.json({ message: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Table deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ message: 'Error deleting table' }, { status: 500 });
  }
}
