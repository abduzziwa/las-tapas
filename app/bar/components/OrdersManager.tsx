import React, { useState, useEffect, useCallback, useRef } from "react";
import OrderContainer, { OrderData } from "./OrderContainer";
import { endpoints } from "@/app/api/endpoint";

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const ordersRef = useRef<OrderData[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${endpoints.next_ip_port}/api/orders/barOrderlist`
      );
      const newData = await response.json();

      if (!Array.isArray(newData)) {
        console.error("Unexpected data format:", newData);
        return;
      }

      const updatedOrders = newData.map((newOrder) => {
        const existing = ordersRef.current.find(
          (o) => o.orderId === newOrder.orderId
        );
        if (!existing || JSON.stringify(existing) !== JSON.stringify(newOrder)) {
          return newOrder;
        }
        return existing;
      });

      const hasChanged =
        updatedOrders.length !== ordersRef.current.length ||
        updatedOrders.some(
          (o, i) =>
            JSON.stringify(o) !== JSON.stringify(ordersRef.current[i])
        );

      if (hasChanged) {
        ordersRef.current = updatedOrders;
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error("Error fetching bar orders:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 3500);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(
    async (orderId: string, sessionId: string, newStatus: "preparing" | "ready") => {
      try {
        const response = await fetch(
          `http://${endpoints.next_ip_port}/api/orders/updateOrderStatus`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, sessionId, status: newStatus }),
          }
        );

        if (response.ok) {
          const updatedOrders = ordersRef.current.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          );
          ordersRef.current = updatedOrders;
          setOrders(updatedOrders);
        } else {
          console.error("Failed to update order status");
        }
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    },
    []
  );

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {orders.length === 0 ? (
        <p className="text-gray-500 text-xl mt-8">No drink orders right now.</p>
      ) : (
        orders.map((order) => (
          <OrderContainer
            key={order.orderId}
            orderData={order}
            onUpdateStatus={updateOrderStatus}
          />
        ))
      )}
    </div>
  );
};

export default OrdersManager;
