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
  status: "ordered" | "preparing" | "ready";
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
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("Unexpected data format received:", data);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      sessionId: string,
      newStatus: "preparing" | "ready"
    ) => {
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
              status: newStatus,
            }),
          }
        );

        if (response.ok) {
          fetchOrders();
        } else {
          console.error("Failed to update order status");
        }
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    },
    [fetchOrders]
  );

  return (
    <div className="flex flex-row flex-wrap gap-3">
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
