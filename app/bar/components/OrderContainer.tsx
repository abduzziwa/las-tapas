"use client";
import React, { useState } from "react";
import Button from "./Button";
import Order from "./Order";
import OrderList from "./OrderList";

export interface OrderData {
  orderId: string;
  sessionId: string;
  tableNumber: string;
  foodItems: {
    foodId: string;
    name: string;
    quantity: number;
    category: string;
    modification: string;
  }[];
  status: "ordered" | "preparing" | "ready";
  payment: "paid" | "unpaid" | "wantToPay";
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
        await onUpdateStatus(orderData.orderId, orderData.sessionId, "preparing");
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
        return { text: "Start", color: "#3B82F6" };
      case "preparing":
        return { text: "Ready", color: "#10B981" };
      case "ready":
        return { text: "Completed", color: "#8A8A8A" };
      default:
        return { text: "Error", color: "#EF4444" };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <div className="ml-5 flex flex-col rounded-[20px] border-solid border-[5px] border-[#3B82F6] p-[12px] gap-y-[10px] w-[22rem]">
      <Order OrderNumber={orderData.orderId} TableNumber={orderData.tableNumber} />
      {orderData.foodItems.map((item) => (
        <OrderList
          key={item.foodId}
          name={item.name}
          quantity={item.quantity}
          modification={item.modification}
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
