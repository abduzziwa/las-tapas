"use client";
import React from "react";
import CloseIcon from "../../public/close-icon.svg";
import MealImage from "../../public/food.png";

interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  allergies: string[];
  price: number;
}

interface Props {
  visibility: "hidden" | "";
  onClose: () => void;
  meal: Meal;
}

const MealPopup: React.FC<Props> = ({ visibility = "", onClose, meal }) => {
  return (
    <div
      className={
        visibility +
        " absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center"
      }
      style={{ caretColor: "transparent" }}
    >
      <div className="flex flex-col z-10 w-[345px] h-[235px] bg-main rounded-[20px] drop-shadow-lg">
        <div className="flex flex-row justify-between items-center w-full h-fit pt-[12px] px-[20px]">
          <p className="text-white text-[16px] leading-tight font-bold">
            Table : 4
          </p>
          <img
            className="w-[16px] h-[16px] cursor-pointer"
            src={CloseIcon.src}
            alt="close-icon"
            onClick={onClose}
          />
        </div>
        <div className="flex w-full h-full px-[20px] py-[8px] gap-[8px]">
          <img
            src={MealImage.src}
            alt={meal.name}
            className="w-40 h-28 rounded-[20px] object-cover object-center"
          />
          <div className="px-[10px] py-10px] gap-[12px]">
            <p className="text-white text-[20px] leading-tight font-light">
              {meal.name}
            </p>
            <p className="text-white text-[12px] leading-tight font-light">
              {meal.description}
            </p>
            <p className="text-white text-[14px] leading-tight font-bold mt-2">
              ${meal.price.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex flex-row w-full h-fit items-center justify-between px-[20px] pb-[12px]">
          <p className="text-white text-[12px] leading-tight font-light">
            Allergies: {meal.allergies.join(", ")}
          </p>
          <button className="px-[12px] py-[10px] bg-white rounded-full text-[12px] leading-tight font-light">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealPopup;
