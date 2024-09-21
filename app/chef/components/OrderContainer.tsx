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
