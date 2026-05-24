import { NextResponse } from "next/server";
import { Orders } from "../../models/Order";
import connectToDatabase from "../../models/Connection";

export async function GET() {
  try {
    await connectToDatabase();

    const rawOrders = await Orders.find({
      status: { $in: ["ordered", "preparing"] },
      "foodItems.category": "drink",
    }).lean();

    // Strip non-drink items out — bar only handles drinks
    const result = rawOrders
      .map((order) => ({
        ...order,
        foodItems: order.foodItems.filter((item: { category: string }) => item.category === "drink"),
      }))
      .filter((order) => order.foodItems.length > 0);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching bar orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 },
    );
  }
}
