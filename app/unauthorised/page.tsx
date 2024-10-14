import React from "react";

const page = () => {
  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <p className="text-4xl text-center text-red-600">Unauthorized Acess</p>
      <p className="mt-11 font-bold text-2xl">Please scan the QRCODE</p>
      <p className="mt-2 font-bold text-2xl">On your table</p>
    </div>
  );
};

export default page;
