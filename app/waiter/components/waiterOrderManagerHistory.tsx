import React, { useState, useEffect, useCallback, useRef } from "react";
import { endpoints } from "@/app/api/endpoint";
import { OrderData } from "@/app/chef/components/OrderContainer";
import WaiterOrderContainer from "./waiterOrderContainerHistory";

const WaiterOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const ordersRef = useRef<OrderData[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${endpoints.next_ip_port}/api/orders/waiterOrderlistServed`
      );
      const newData = await response.json();
      if (Array.isArray(newData)) {
        let hasChanged = false;

        const updatedOrders = newData.map((newOrder) => {
          const existingOrder = ordersRef.current.find(
            (order) => order.orderId === newOrder.orderId
          );
          if (
            !existingOrder ||
            JSON.stringify(existingOrder) !== JSON.stringify(newOrder)
          ) {
            hasChanged = true;
            return newOrder;
          }
          return existingOrder;
        });

        // Check for removed orders
        if (updatedOrders.length !== ordersRef.current.length) {
          hasChanged = true;
        }

        if (hasChanged) {
          ordersRef.current = updatedOrders;
          setOrders(updatedOrders);
        }
      } else {
        console.error("Unexpected data format received:", newData);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 2000); // Fetch every 2 seconds

    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {orders.map((order) => (
        <WaiterOrderContainer key={order.orderId} orderData={order} />
      ))}
    </div>
  );
};

export default WaiterOrderManager;
