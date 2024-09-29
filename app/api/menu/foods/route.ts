// import { NextResponse } from "next/server";
// import connectToDatabase from "../../models/Connection";
// import { Menu } from "../../models/menuItem";


// export async function GET(req: Request) {
//     try {
//         await connectToDatabase();
//         const result = await Menu.find({ category: 'food' })
//         console.log("Menu Requested: " +  Date.now())
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error('Error fetching menu items:', error);
//         return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
//     }
// }
import { NextResponse } from "next/server";
import connectToDatabase from "../../models/Connection";
import { Menu } from "../../models/menuItem";

export async function GET(req: Request) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Fetch the menu items
        const result = await Menu.find({ category: 'food' });
        console.log("Menu Requested: " + Date.now());

        // Create the response with CORS headers
        const response = NextResponse.json(result, { status: 200 });

        // Set CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*'); // Allows all origins
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers

        return response;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
    }
}
