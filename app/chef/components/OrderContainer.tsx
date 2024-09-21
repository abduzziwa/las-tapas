// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import Button from "./Button";
// import Order from "./Order";
// import OrderList from "./OrderList";

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
//   status: "ordered" | "preparing";
//   timestamps: {
//     orderedAt: string;
//   };
// }

// const OrderContainer: React.FC = () => {
//   const [orderData, setOrderData] = useState<OrderData | null>(null);

//   const fetchOrder = useCallback(async () => {
//     try {
//       const response = await fetch(
//         "http://localhost:3000/api/orders/chefOrderlist"
//       );
//       const data = await response.json();
//       setOrderData(data[0]); // Assuming we're using the first order from the array
//     } catch (error) {
//       console.error("Error fetching order data:", error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOrder();
//   }, [fetchOrder]);

//   const updateOrderStatus = async () => {
//     if (!orderData) return;

//     try {
//       const response = await fetch(
//         `http://localhost:3000/api/orders/updateOrderStatus`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             orderId: orderData.orderId,
//             sessionId: orderData.sessionId,
//             status: "preparing",
//           }),
//         }
//       );

//       if (response.ok) {
//         // Refetch the order data to get the updated status
//         fetchOrder();
//       } else {
//         console.error("Failed to update order status");
//       }
//     } catch (error) {
//       console.error("Error updating order status:", error);
//     }
//   };

//   if (!orderData) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="flex flex-col rounded-[20px] border-solid border-[5px] border-[#FB9933] p-[12px] w-fit gap-y-[10px]">
//       <Order
//         OrderNumber={orderData.orderId}
//         TableNumber={orderData.tableNumber}
//       />
//       {orderData.foodItems.map((item) => (
//         <OrderList
//           key={item._id}
//           name={item.foodName}
//           quantity={item.quantity}
//           description="" // Add description if available in your data
//         />
//       ))}
//       <Button
//         text={orderData.status === "ordered" ? "Start" : "Preparing"}
//         color={orderData.status === "ordered" ? "#FB9933" : "#4CAF50"}
//         onClick={updateOrderStatus}
//         disabled={orderData.status !== "ordered"}
//       />
//     </div>
//   );
// };

// export default OrderContainer;
import React from "react";
import Button from "./Button";
import Order from "./Order";
import OrderList from "./OrderList";

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

interface Props {
  orderData: OrderData;
  onUpdateStatus: (orderId: string, sessionId: string) => void;
}

const OrderContainer: React.FC<Props> = ({ orderData, onUpdateStatus }) => {
  return (
    <div className="flex flex-col rounded-[20px] border-solid border-[5px] border-[#FB9933] p-[12px] w-fit gap-y-[10px]">
      <Order
        OrderNumber={orderData.orderId}
        TableNumber={orderData.tableNumber}
      />
      {orderData.foodItems.map((item) => (
        <OrderList
          key={item._id}
          name={item.foodName}
          quantity={item.quantity}
          description="" // Add description if available in your data
        />
      ))}
      <Button
        text={orderData.status === "ordered" ? "Start" : "Preparing"}
        color={orderData.status === "ordered" ? "#FB9933" : "#4CAF50"}
        onClick={() => onUpdateStatus(orderData.orderId, orderData.sessionId)}
        disabled={orderData.status !== "ordered"}
      />
    </div>
  );
};

export default OrderContainer;
