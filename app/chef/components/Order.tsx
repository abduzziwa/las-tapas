// import React from "react";
// interface Props {
//   OrderNumber: string;
//   TableNumber: string;
// }

// const Order = ({ OrderNumber, TableNumber }: Props) => {
//   function getFormattedDateTime(): string {
//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = now.getMinutes();
//     const day = now.getDate().toString().padStart(2, "0");
//     const month = (now.getMonth() + 1).toString().padStart(2, "0");
//     const year = now.getFullYear();

//     const time = `${hours}:${minutes} ${hours >= 12 ? "pm" : "am"}`;
//     const date = `${day} ${month} ${year}`;

//     return `${time}, ${date}`;
//   }

//   const formattedDateTime = getFormattedDateTime();
//   return (
//     <>
//       <div className="flex border-solid border-2 border-[#8A8A8A] p-[20px] rounded-[20px] justify-between">
//         <div>
//           <p className="leading-tight text-[20px]">
//             {" "}
//             Order #{parseInt(OrderNumber.slice(1))}
//           </p>
//           <p className="leading-tight font-normal text-[14px]">
//             {formattedDateTime}
//           </p>
//         </div>

//         <div className="flex flex-col justify-center items-center flex-">
//           <h2 className="leading-tight text-[28px] font-bold">{TableNumber}</h2>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Order;

// Order.tsx
import React from "react";

interface Props {
  OrderNumber: string;
  TableNumber: string;
}

const Order = ({ OrderNumber, TableNumber }: Props) => {
  function getFormattedDateTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();

    const time = `${hours}:${minutes} ${hours >= 12 ? "pm" : "am"}`;
    const date = `${day} ${month} ${year}`;

    return `${time}, ${date}`;
  }

  const formattedDateTime = getFormattedDateTime();
  return (
    <div className="flex border-solid border-2 border-[#8A8A8A] p-[20px] rounded-[20px] justify-between">
      <div>
        <p className="leading-tight text-[20px]">Order #{OrderNumber}</p>
        <p className="leading-tight font-normal text-[14px]">
          {formattedDateTime}
        </p>
      </div>
      <div className="flex flex-col justify-center items-center flex-">
        <h2 className="leading-tight text-[28px] font-bold">{TableNumber}</h2>
      </div>
    </div>
  );
};

export default Order;
