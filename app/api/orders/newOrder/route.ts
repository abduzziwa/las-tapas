import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { Tables } from '../../models/tables';
import { Orders } from '../../models/Order';

const ORDER_ID_PADDING = 4; // For 0001 to 9999

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { sessionId, tableNumber, foodItems } = await request.json();

    // Validate request payload
    if (!sessionId || !tableNumber || !foodItems || !Array.isArray(foodItems)) {
      console.error('Invalid request body:', { sessionId, tableNumber, foodItems });
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Validate foodItems structure
    const invalidFoodItems = foodItems.some(item =>
      !item.foodId || !item.name || !item.quantity || !item.price || !item.category
    );
    if (invalidFoodItems) {
      console.error('Invalid food items structure:', foodItems);
      return NextResponse.json({ message: 'Each food item must have foodId, name, quantity, price and category' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if the table number and session ID match
    const table = await Tables.findOne({
      tableNumber,
      occupiedBy: sessionId,
      status: 'occupied'
    });

    if (!table) {
      console.error('Unauthorized request: Invalid table number or session ID:', { tableNumber, sessionId });
      return NextResponse.json({ message: 'Unauthorized: Invalid table number or session ID' }, { status: 403 });
    }

  //   // Generate new orderId
  //   const lastOrder = await Orders.findOne({}, {}, { sort: { orderId: -1 } });

  //   let newOrderId;
  //   if (lastOrder && lastOrder.orderId) {
  // // Remove leading zeros if they exist
  //     const lastOrderNumber = parseInt(lastOrder.orderId.replace(/^0+/, ''), 10);
  //     newOrderId = (lastOrderNumber + 1).toString();
  //   } else {
  //     newOrderId = '1';
  //   }

  const lastOrder = await Orders.findOne({}, {}, { sort: { orderId: -1 } });
    
  let newOrderId: string;
  if (lastOrder && lastOrder.orderId) {
    // Convert the orderId to a number and increment
    const lastOrderNumber = parseInt(lastOrder.orderId);
    if (isNaN(lastOrderNumber)) {
      throw new Error('Invalid order ID format in database');
    }
    
    // Check if we're about to exceed the maximum value
    if (lastOrderNumber >= Math.pow(10, ORDER_ID_PADDING) - 1) {
      throw new Error('Maximum order ID limit reached');
    }
    
    // Pad with zeros to maintain 4-digit format
    newOrderId = (lastOrderNumber + 1).toString().padStart(ORDER_ID_PADDING, '0');
  } else {
    // If no previous orders, start with '0001'
    newOrderId = '1'.padStart(ORDER_ID_PADDING, '0');
  }


    // Create the order object
    const order = {
      orderId: newOrderId,
      sessionId,
      tableNumber,
      foodItems,  // Make sure foodItems is passed directly without modification
      status: 'ordered',
      payment: 'unpaid',
      timestamps: {
        orderedAt: new Date(),
      },
    };

    // Create a new order document
    const newOrder = new Orders(order);

    // Validate the order before saving
    try {
      await newOrder.validate();  // This will trigger any schema validation errors
    } catch (validationError) {
      console.error('Order validation failed:', validationError);
      return NextResponse.json({ message: 'Order validation failed', error: validationError }, { status: 400 });
    }

    // Save the order to the database
    const result = await newOrder.save();

    // Respond with success
    if (result) {
      console.log('Order created successfully:', result);
      return NextResponse.json({ message: 'Order created successfully', orderId: newOrderId }, { status: 201 });
    } else {
      console.error('Failed to create order:', result);
      return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: (error as Error).message }, { status: 500 });
  }
}
