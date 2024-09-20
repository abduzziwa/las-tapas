import React from "react";

const confirmOrderPopup = () => {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center">
      <div className="flex flex-col z-10 w-[345px] h-[235px] bg-gradient-to-tr from-main to-gradientEnd rounded-[20px] drop-shadow-lg">
        <div className="flex flex-row justify-between items-center w-full h-fit pt-[12px] px-[20px]">
          <p className="text-white text-[16px] leading-tight font-bold">
            Table : 4
          </p>
          <button>
            <img
              className="w-[16px] h-[16px]"
              src="/close-icon.svg"
              alt="close-icon"
            />
          </button>
        </div>
        <div className="flex flex-col w-full h-full px-[20px] py-[8px] gap-[4px]">
          <div className="flex justify-between">
            <p className="text-white text-[20px] leading-tight font-light">
              item
            </p>
            <p className="text-white text-[20px] leading-tight font-light">
              1x
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-white text-[20px] leading-tight font-light">
              item
            </p>
            <p className="text-white text-[20px] leading-tight font-light">
              1x
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-white text-[20px] leading-tight font-light">
              item
            </p>
            <p className="text-white text-[20px] leading-tight font-light">
              1x
            </p>
          </div>
        </div>
        <div className="flex flex-row w-full items-center p-[12px] gap-[10px] justify-end">
          <button className="px-[12px] py-[10px] bg-maingreen rounded-full text-[12px] leading-tight font-light">
            Confirm order
          </button>
          <button className="px-[12px] py-[10px] bg-mainred rounded-full text-[12px] leading-tight font-light">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default confirmOrderPopup;
