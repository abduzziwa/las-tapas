import React from "react";
import MealImage from "../../public/food.png";

interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  allergies: string[];
  price: number;
}

interface MealComponentProps {
  meal: Meal;
  onMealClick: () => void;
}

const MealComponent: React.FC<MealComponentProps> = ({ meal, onMealClick }) => {
  return (
    <div
      onClick={onMealClick}
      className='cursor-pointer flex flex-col w-1/2 h-[150px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-black bg-[url("../public/food.png")] bg-cover bg-center'
    >
      {/* <img
        src={MealImage.src}
        alt={meal.name}
        className="w-full h-40 object-cover rounded-lg"
      /> */}
      <h3 className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
        {meal.name}
      </h3>
      <p className="text-white text-[24px] leading-tight font-light drop-shadow-lg">
        {meal.description}
      </p>
      <p className="text-white text-[24px] leading-tight font-light drop-shadow-lg">
        ${meal.price.toFixed(2)}
      </p>
    </div>
  );
};

export default MealComponent;
