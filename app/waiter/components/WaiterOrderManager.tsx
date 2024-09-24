// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import WaiterOrderContainer from "./WaiterOrderContainer";

// interface OrderData {
//   _id: string;
//   orderId: string;
//   sessionId: string;
//   tableNumber: string;
//   foodItems: {
//     foodId: string;
//     foodName: string;
//     quantity: number;
//     _id: string;
//   }[];
//   status: "ordered" | "preparing" | "ready";
//   timestamps: {
//     orderedAt: string;
//   };
// }

// const WaiterOrderManager: React.FC = () => {
//   const [orders, setOrders] = useState<OrderData[]>([]);

//   const fetchOrders = useCallback(async () => {
//     try {
//       const response = await fetch(
//         "http://localhost:3000/api/orders/waiterOrderList"
//       );
//       const data = await response.json();
//       if (Array.isArray(data)) {
//         setOrders(data);
//       } else {
//         console.error("Unexpected data format received:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching order data:", error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   const updateOrderStatus = useCallback(
//     async (
//       orderId: string,
//       sessionId: string,
//       newStatus: "preparing" | "ready" | "served"
//     ) => {
//       try {
//         const response = await fetch(
//           `http://localhost:3000/api/orders/updateOrderStatus`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               orderId,
//               sessionId,
//               status: newStatus,
//             }),
//           }
//         );

//         if (response.ok) {
//           fetchOrders();
//         } else {
//           console.error("Failed to update order status");
//         }
//       } catch (error) {
//         console.error("Error updating order status:", error);
//       }
//     },
//     [fetchOrders]
//   );

//   return (
//     <div className="flex flex-row flex-wrap gap-3">
//       {orders.map((order) => (
//         <WaiterOrderContainer
//           key={order._id}
//           orderData={order}
//           onUpdateStatus={updateOrderStatus}
//         />
//       ))}
//     </div>
//   );
// };

// export default WaiterOrderManager;
import React, { useState, useEffect, useCallback, useRef } from "react";
import WaiterOrderContainer from "./WaiterOrderContainer";

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
  status: "ordered" | "preparing" | "ready" | "served";
  timestamps: {
    orderedAt: string;
  };
}

const WaiterOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const ordersRef = useRef<OrderData[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/orders/waiterOrderList"
      );
      const newData = await response.json();
      if (Array.isArray(newData)) {
        let hasChanged = false;

        const updatedOrders = newData.map((newOrder) => {
          const existingOrder = ordersRef.current.find(
            (order) => order._id === newOrder._id
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

  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      sessionId: string,
      newStatus: "preparing" | "ready" | "served"
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
      {orders.map((order) => (
        <WaiterOrderContainer
          key={order._id}
          orderData={order}
          onUpdateStatus={updateOrderStatus}
        />
      ))}
    </div>
  );
};

export default WaiterOrderManager;
