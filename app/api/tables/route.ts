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

