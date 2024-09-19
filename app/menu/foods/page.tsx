"use client";
import React, { useState } from "react";
import TopNavBar from "../../components/TopNavBar";
import BottomNavBar from "../../components/BottomNavBar";
import MealComponent from "../../components/MealComponent";
import MealPopup from "@/app/components/MealPopup";
import Link from "next/link";

// Define an interface for the meal data
interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  allergies: string[];
  price: number;
}

// Mock data (replace this with your actual data fetching logic)
const mockMeals: Meal[] = [
  {
    id: "1",
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta dish",
    image: "../public/food.png",
    allergies: ["eggs", "dairy"],
    price: 12.99,
  },
  // Add more mock meals as needed
];

export default function Foods() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setSelectedMeal(null);
  };

  return (
    <main>
      <TopNavBar />

      <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">
        <div className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/food.png')] bg-cover bg-center">
          <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
            Food
          </p>
        </div>
      </div>

      <div className="w-full p-[24px] gap-[10px]">
        {mockMeals.map((meal) => (
          <MealComponent
            key={meal.id}
            meal={meal}
            onMealClick={() => handleMealClick(meal)}
          />
        ))}
      </div>

      {selectedMeal && (
        <MealPopup
          visibility={isPopupVisible ? "" : "hidden"}
          onClose={handleClosePopup}
          meal={selectedMeal}
        />
      )}

      <BottomNavBar />
    </main>
  );
}
