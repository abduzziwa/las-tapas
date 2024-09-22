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
import React, { useState } from "react";
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
  status: "ordered" | "preparing" | "ready";
  timestamps: {
    orderedAt: string;
  };
}

interface Props {
  orderData: OrderData;
  onUpdateStatus: (
    orderId: string,
    sessionId: string,
    newStatus: "preparing" | "ready"
  ) => Promise<void>;
}

const OrderContainer: React.FC<Props> = ({ orderData, onUpdateStatus }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      if (orderData.status === "ordered") {
        await onUpdateStatus(
          orderData.orderId,
          orderData.sessionId,
          "preparing"
        );
      } else if (orderData.status === "preparing") {
        await onUpdateStatus(orderData.orderId, orderData.sessionId, "ready");
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
        return { text: "Start", color: "#FB9933" };
      case "preparing":
        return { text: "Ready", color: "#4CAF50" };
      case "ready":
        return { text: "Completed", color: "#8A8A8A" };
      default:
        return { text: "Error", color: "#FF0000" };
    }
  };

  const buttonProps = getButtonProps();

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
        text={buttonProps.text}
        color={buttonProps.color}
        onClick={handleButtonClick}
        isLoading={isLoading}
      />
    </div>
  );
};

export default OrderContainer;
