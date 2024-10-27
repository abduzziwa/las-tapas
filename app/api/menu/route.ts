import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import { Menu, MenuItem } from '../models/menuItem';


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

export async function PUT(req: Request): Promise<Response> {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse the request body to get the incoming menu item data
        const data: Partial<MenuItem> = await req.json();
        const { _id, ...fieldsToUpdate } = data;

        // Validate the input: _id is required
        if (!_id) {
            return NextResponse.json({ message: 'Menu item ID (_id) is required' }, { status: 400 });
        }

        // Fetch the existing menu item from the database
        const existingMenuItem = await Menu.findById(_id) as MenuItem | null;
        if (!existingMenuItem) {
            return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
        }

        // Create an update object with only the fields that have changed
        const updateFields: Record<string, string | number | boolean | string[]> = {};
        // for (const [key, value] of Object.entries(fieldsToUpdate)) {
        //     if (value !== undefined && value !== existingMenuItem[key as keyof MenuItem]) {
        //         // Type guard to ensure the value matches the expected type of the menu item
        //         // if (typeof value === typeof existingMenuItem[key as keyof MenuItem]) {
        //         //     // updateFields[key as keyof MenuItem] = value as MenuItem[keyof MenuItem];
        //         //     (Object.entries(fieldsToUpdate) as [keyof MenuItem, MenuItem[keyof MenuItem]][])
        //         // }
        //     }
        // }
        (Object.entries(fieldsToUpdate) as [keyof MenuItem, MenuItem[keyof MenuItem]][]).forEach(([key, value]) => {
            if (value !== undefined && value !== existingMenuItem[key]) {
                updateFields[key as string] = value;
            }
        });

        // If there are no changes, return a response indicating no updates were needed
        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ message: 'No changes detected' }, { status: 200 });
        }

        // Update the menu item in the database
        const updatedMenuItem = await Menu.findByIdAndUpdate(_id, updateFields, { new: true });

        // Return a success response with the updated menu item data
        return NextResponse.json({ message: 'Menu item updated successfully', item: updatedMenuItem }, { status: 200 });
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json({ message: 'Error updating menu item' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse the request body to extract the menu item information
        const {
            foodId,
            name,
            description,
            price,
            category,
            ingredients,
            halal,
            vegetarian,
            alcoholic,
            countryOfOrigin,
            imageUrl,
        } = await req.json();

        // Validate the input
        if (!foodId || !name || !description || !price || !category || !ingredients || halal === undefined || vegetarian === undefined || alcoholic === undefined || !countryOfOrigin || !imageUrl) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Attempt to create a new menu item in the database
        const newMenuItem = await Menu.create({
            foodId: foodId,
            name: name,
            description: description,
            price: price,
            category: category,
            ingredients: ingredients,
            halal: halal,
            vegetarian: vegetarian,
            alcoholic: alcoholic,
            countryOfOrigin: countryOfOrigin,
            imageUrl: imageUrl,
        });

        // Return a success response with the newly created menu item data
        return NextResponse.json({ message: 'Menu item added successfully', item: newMenuItem }, { status: 201 });
    } catch (error) {
        console.error('Error adding menu item:', error);
        return NextResponse.json({ message: 'Error adding menu item' }, { status: 500 });
    }
}
