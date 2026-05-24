import React from "react";

interface Props {
  quantity: number;
  name: string;
  modification: string;
}

const OrderList = ({ name, quantity, modification }: Props) => {
  return (
    <div className="flex gap-4">
      <p className="font-bold">{quantity} X</p>
      <div>
        <p className="font-bold">{name}</p>
        {modification && <p className="text-sm text-gray-500">{modification}</p>}
      </div>
    </div>
  );
};

export default OrderList;
