"use client";
import React, { useState, useEffect, useCallback } from "react";
import OrderContainer from "./OrderContainer";

interface OrderData {
  _id: string;
  orderId: string;
  sessionId: string;
  tableNumber: string;
  foodItems: {
    foodId: string;
    foodName: string;
    quantity: number;
    _id: string;
  }[];
  status: "ordered" | "preparing";
  timestamps: {
    orderedAt: string;
  };
}

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/orders/chefOrderlist"
      );
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, sessionId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/orders/updateOrderStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            sessionId,
            status: "preparing",
          }),
        }
      );

      if (response.ok) {
        // Refetch the order data to get the updated status
        fetchOrders();
      } else {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => (
        <OrderContainer
          key={order._id}
          orderData={order}
          onUpdateStatus={updateOrderStatus}
        />
      ))}
    </div>
  );
};

export default OrdersManager;
