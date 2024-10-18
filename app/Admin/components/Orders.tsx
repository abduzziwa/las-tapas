// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { endpoints } from "@/app/api/endpoint";
// import { Badge } from "@/components/ui/badge";
// import GreenBadge from "./GreenBadge";
// import StatusBadge from "./StatusBadge";

// interface FoodItem {
//   foodId: string;
//   name: string;
//   quantity: number;
//   modification: string;
//   price: number;
//   category: "food" | "drink" | "dessert";
// }

// interface Order {
//   orderId: string;
//   sessionId: string;
//   tableNumber: string;
//   foodItems: FoodItem[];
//   status: "notYetOrdered" | "ordered" | "preparing" | "ready" | "served";
//   payment: "paid" | "unpaid";
//   timestamps: {
//     orderedAt?: Date;
//     preparingAt?: Date;
//     readyAt?: Date;
//     servedAt?: Date;
//   };
// }

// const Orders = () => {
//   const [orders, setOrders] = useState<Order[]>([]);

//   useEffect(() => {
//     fetchOrders();
//     const interval = setInterval(fetchOrders, 1000); // Fetch every 10 seconds10000
//     return () => clearInterval(interval);
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await fetch(
//         `http://${endpoints.next_ip_port}/api/orders`
//       );
//       if (!response.ok) throw new Error("Failed to fetch orders");
//       const data: Order[] = await response.json();
//       setOrders((prevOrders) => {
//         const newOrders = data.filter(
//           (order) =>
//             !prevOrders.some((prevOrder) => prevOrder.orderId === order.orderId)
//         );
//         return [...newOrders, ...prevOrders];
//       });
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//   };

//   // const handleStatusChange = async (
//   //   orderId: string,
//   //   newStatus: Order["status"]
//   // ) => {
//   //   try {
//   //     const response = await fetch(
//   //       `http://${endpoints.next_ip_port}/api/orders/${orderId}`,
//   //       {
//   //         method: "PATCH",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify({ status: newStatus }),
//   //       }
//   //     );
//   //     if (!response.ok) throw new Error("Failed to update order status");
//   //     setOrders((prevOrders) =>
//   //       prevOrders.map((order) =>
//   //         order.orderId === orderId ? { ...order, status: newStatus } : order
//   //       )
//   //     );
//   //   } catch (error) {
//   //     console.error("Error updating order status:", error);
//   //   }
//   // };

//   // const handlePaymentChange = async (
//   //   orderId: string,
//   //   newPayment: Order["payment"]
//   // ) => {
//   //   try {
//   //     const response = await fetch(
//   //       `http://${endpoints.next_ip_port}/api/orders`,
//   //       {
//   //         method: "PATCH",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify({ payment: newPayment }),
//   //       }
//   //     );
//   //     if (!response.ok) throw new Error("Failed to update payment status");
//   //     setOrders((prevOrders) =>
//   //       prevOrders.map((order) =>
//   //         order.orderId === orderId ? { ...order, payment: newPayment } : order
//   //       )
//   //     );
//   //   } catch (error) {
//   //     console.error("Error updating payment status:", error);
//   //   }
//   // };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Orders</h2>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Order ID</TableHead>
//             <TableHead>Table</TableHead>
//             <TableHead>Items</TableHead>
//             <TableHead>Total</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Payment</TableHead>
//             {/* <TableHead>Actions</TableHead> */}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {orders.map((order) => (
//             <TableRow key={order.orderId}>
//               <TableCell>{order.orderId}</TableCell>
//               <TableCell>{order.tableNumber}</TableCell>
//               <TableCell>
//                 {order.foodItems.map((item, index) => (
//                   <div key={index}>
//                     {item.name} x{item.quantity}
//                   </div>
//                 ))}
//               </TableCell>
//               <TableCell>
//                 $
//                 {order.foodItems
//                   .reduce(
//                     (total, item) => total + item.price * item.quantity,
//                     0
//                   )
//                   .toFixed(2)}
//               </TableCell>
//               <TableCell>
//                 {
//                   <StatusBadge status={order.status}>
//                     {order.status}
//                   </StatusBadge>
//                 }
//               </TableCell>
//               <TableCell>
//                 {order.payment === "paid" ? (
//                   <GreenBadge>{order.payment}</GreenBadge>
//                 ) : (
//                   <Badge variant="destructive">{order.payment}</Badge>
//                 )}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default Orders;
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { endpoints } from "@/app/api/endpoint";
import { Badge } from "@/components/ui/badge";
import GreenBadge from "./GreenBadge";
import StatusBadge, { StatusBadgeProps } from "./StatusBadge";

interface FoodItem {
  foodId: string;
  name: string;
  quantity: number;
  modification: string;
  price: number;
  category: "food" | "drink" | "dessert";
}

interface Order {
  orderId: string;
  sessionId: string;
  tableNumber: string;
  foodItems: FoodItem[];
  status: "notYetOrdered" | "ordered" | "preparing" | "ready" | "served";
  payment: "paid" | "unpaid";
  timestamps: {
    orderedAt?: Date;
    preparingAt?: Date;
    readyAt?: Date;
    servedAt?: Date;
  };
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Fetch every 10 seconds (1000 ms)
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `http://${endpoints.next_ip_port}/api/orders`
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data: Order[] = await response.json();

      // Compare current state with fetched data and update if there's any change
      setOrders((prevOrders) => {
        const updatedOrders = data.map((fetchedOrder) => {
          const existingOrder = prevOrders.find(
            (order) => order.orderId === fetchedOrder.orderId
          );

          // If the order doesn't exist in the current state, add it
          if (!existingOrder) {
            return fetchedOrder;
          }

          // If the order exists but has differences, update it
          return {
            ...existingOrder,
            ...(JSON.stringify(existingOrder) !== JSON.stringify(fetchedOrder)
              ? fetchedOrder
              : {}),
          };
        });

        // Ensure the list contains all orders (including newly added)
        return updatedOrders;
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Orders</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell>{order.orderId}</TableCell>
              <TableCell>{order.tableNumber}</TableCell>
              <TableCell>
                {order.foodItems.map((item, index) => (
                  <div key={index}>
                    {item.name} x{item.quantity}
                  </div>
                ))}
              </TableCell>
              <TableCell>
                $
                {order.foodItems
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status}>{order.status}</StatusBadge>
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={order.payment as StatusBadgeProps["status"]}
                >
                  {order.payment}
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Orders;
