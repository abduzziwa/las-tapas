// // export default OrderContainer;
// import React from "react";
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

// interface Props {
//   orderData: OrderData;
//   onUpdateStatus: (orderId: string, sessionId: string) => void;
// }

// const OrderContainer: React.FC<Props> = ({ orderData, onUpdateStatus }) => {
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
//         onClick={() => onUpdateStatus(orderData.orderId, orderData.sessionId)}
//         disabled={orderData.status !== "ordered"}
//       />
//     </div>
//   );
// };

// export default OrderContainer;
"use client";
import React, { useState } from "react";
import WaiterOrderList from "./WaiterOrderList";
import WaiterButton from "./WaiterButton";
import WaiterOrder from "./WaiterOrder";
import { time } from "console";

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

interface Props {
  orderData: OrderData;
  onUpdateStatus: (
    orderId: string,
    sessionId: string,
    newStatus: "preparing" | "ready" | "served"
  ) => Promise<void>;
}

const WaiterOrderContainer: React.FC<Props> = ({
  orderData,
  onUpdateStatus,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      if (orderData.status === "ready") {
        await onUpdateStatus(orderData.orderId, orderData.sessionId, "served");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonProps = () => {
    switch (orderData.status) {
      case "ordered":
        return { text: "Start", color: "#FB9933", disable: false };
      case "preparing":
        return { text: "prep...", color: "#fdce9b", disable: true };
      case "ready":
        return { text: "Serve", color: "#4CAF50", disable: false };
      default:
        return { text: "Error", color: "#FF0000", disable: true };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <div className="ml-11 flex flex-col rounded-[20px] border-solid border-[5px] border-[#FB9933] p-[12px] gap-y-[10px] w-[17rem]">
      <WaiterOrder
        OrderNumber={orderData.orderId}
        TableNumber={orderData.tableNumber}
      />
      {orderData.foodItems.map((item) => (
        <WaiterOrderList
          key={item._id}
          name={item.foodName}
          quantity={item.quantity}
          description=""
        />
      ))}
      <WaiterButton
        text={buttonProps.text}
        color={buttonProps.color}
        onClick={handleButtonClick}
        isLoading={isLoading}
        disable={buttonProps.disable}
      />
    </div>
  );
};

export default WaiterOrderContainer;
