import React from "react";

interface Props {
  OrderNumber: string;
  TableNumber: string;
  GuestName?: string;
}

const WaiterOrder = ({ OrderNumber, TableNumber, GuestName }: Props) => {
  function getFormattedDateTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const period = hours >= 12 ? "pm" : "am";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${period}, ${day}/${month}/${year}`;
  }

  return (
    <div className="flex border-solid border-2 border-[#8A8A8A] p-[16px] rounded-[20px] justify-between w-[15rem]">
      <div>
        <p className="leading-tight text-[18px] font-semibold">Order #{OrderNumber}</p>
        <p className="leading-tight font-normal text-[13px] text-gray-500">
          {getFormattedDateTime()}
        </p>
        {GuestName ? (
          <p className="mt-1 text-[13px] font-medium text-orange-600">
            👤 {GuestName}
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-gray-400 italic">Anonymous guest</p>
        )}
      </div>
      <div className="flex flex-col justify-center items-center">
        <h2 className="leading-tight text-[26px] font-bold">{TableNumber}</h2>
      </div>
    </div>
  );
};

export default WaiterOrder;
