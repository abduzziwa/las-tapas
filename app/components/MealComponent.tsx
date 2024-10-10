import React from "react";
import { Meal } from "../menu/foods/page";

interface MealComponentProps {
  meal: Meal;
  onMealClick: () => void;
}

const MealComponent: React.FC<MealComponentProps> = ({ meal, onMealClick }) => {
  return (
    <div
      onClick={onMealClick}
      className='cursor-pointer flex flex-col w-[10.80rem] h-[150px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-black bg-[url("../public/food.png")] bg-cover bg-center bg-opacity-50 mt-2'
    >
      {/* <img
        src={MealImage.src}
        alt={meal.name}
        className="w-full h-40 object-cover rounded-lg"
      /> */}
      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-[20px]"></div>
      <h3 className="text-white text-[25px] font-bold drop-shadow-lg leading-tight">
        {meal.name}
      </h3>
      <p className="text-white text-[15px] leading-tight font-light drop-shadow-lg">
        {meal.description}
      </p>
      {/* <p className="text-white text-[24px] leading-tight font-light drop-shadow-lg">
        ${meal.price.toFixed(2)}
      </p> */}
    </div>
  );
};

export default MealComponent;
