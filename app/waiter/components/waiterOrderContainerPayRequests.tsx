"use client";
import React, { useState } from "react";
import WaiterOrderList from "./WaiterOrderList";
import WaiterButton from "./WaiterButton";
import WaiterOrder from "./WaiterOrder";
import { OrderData } from "@/app/chef/components/OrderContainer";
import { endpoints } from "@/app/api/endpoint";

interface Props {
  orderData: OrderData;
}

const WaiterOrderPaymentContainer: React.FC<Props> = ({ orderData }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentUpdate = async () => {
    setIsLoading(true);
    const employeeID = sessionStorage.getItem("employeeId");
    try {
      const response = await fetch(
        `http://${endpoints.next_ip_port}/api/orders/waiterOrderlistWantToPay?orderId=${orderData.orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: orderData.sessionId,
            paymentStatus: "paid",
            employeeId: employeeID,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-11 flex flex-col rounded-[20px] border-solid border-[5px] border-[#FB9933] p-[12px] gap-y-[10px] w-[17rem]">
      <WaiterOrder
        OrderNumber={orderData.orderId}
        TableNumber={orderData.tableNumber}
      />
      {orderData.foodItems.map((item) => (
        <WaiterOrderList
          key={item.foodId}
          name={item.name}
          quantity={item.quantity}
          description=""
        />
      ))}
      <WaiterButton
        text="Pay"
        color="#218838"
        onClick={handlePaymentUpdate}
        isLoading={isLoading}
        disable={isLoading}
      />
    </div>
  );
};

export default WaiterOrderPaymentContainer;
