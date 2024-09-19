import React from "react";
import CloseIcon from "../../public/close-icon.svg";
import MealImage from "../../public/food.png";

const MealPopup = () => {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center">
      <div className="flex flex-col z-10 w-[345px] h-[235px] bg-main rounded-[20px] drop-shadow-lg">
        <div className="flex flex-row justify-between items-center w-full h-fit pt-[12px] px-[20px]">
          <p className="text-white text-[16px] leading-tight font-bold">
            Table : 4
          </p>
          <img
            className="w-[16px] h-[16px]"
            src={CloseIcon.src}
            alt="close-icon"
          />
        </div>
        <div className="flex w-full h-full px-[20px] py-[8px] gap-[8px]">
          <img
            className="w-40 h-28 rounded-[20px] object-cover object-center"
            src={MealImage.src}
            alt="meal-image"
          />
          <div className="px-[10px] py-10px] gap-[12px]">
            <p className="text-white text-[20px] leading-tight font-light">
              Item name
            </p>
            <p className="text-white text-[12px] leading-tight font-light">
              Item description
            </p>
          </div>
        </div>
        <div className="flex flex-row w-full h-fit items-center justify-between px-[20px] pb-[12px]">
            <p className="text-white text-[12px] leading-tight font-light">
                Allergies:
            </p>
            <button className="px-[12px] py-[10px] bg-white rounded-full text-[12px] leading-tight font-light">Add to cart</button>
        </div>
      </div>
    </div>
  );
};

export default MealPopup;
