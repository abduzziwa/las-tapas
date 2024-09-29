"use client";
import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import BottomNavBar from "../../components/BottomNavBar";
import MealComponent from "../../components/MealComponent";
import MealPopup from "@/app/components/MealPopup";

export interface Meal {
  foodId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  halal: boolean;
  vegetarian: boolean;
  countryOfOrigin: string;
  imageUrl: string;
  createdAt: {
    $date: string;
  };
}

interface OrderItem {
  foodId: string;
  name: string;
  quantity: number;
  modification: string;
}

export default function Foods() {
  const [meals, setMeals] = useState<Meal[]>([]); // State to store meals fetched from API
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [desertsCartItems, setDesertsCartItems] = useState<OrderItem[]>([]); // State to store the cart items

  // Fetch meals from the API on component mount
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch(
          "http://192.168.178.12:3000/api/menu/deserts"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch meals");
        }
        const data: Meal[] = await response.json();
        setMeals(data);
        console.log(meals); // Set the fetched meals into state
      } catch (error) {
        console.error(error);
      }
    };

    fetchMeals();
  }, []);

  // Handle opening the meal popup when a meal is clicked
  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsPopupVisible(true);
  };

  // Handle closing the meal popup
  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setSelectedMeal(null);
  };

  // Handle adding a meal to the cart
  const handleAddToCart = (mealData: {
    foodId: string;
    foodName: string;
    quantity: number;
    foodPrice: number;
    modification: string;
  }) => {
    const newOrderItem: OrderItem = {
      foodId: mealData.foodId,
      name: mealData.foodName,
      quantity: mealData.quantity,
      modification: mealData.modification,
    };
    // Add the new meal to the cartItems array
    setDesertsCartItems((prevItems) => [...prevItems, newOrderItem]);
  };

  console.log(desertsCartItems);

  return (
    <main>
      <TopNavBar />

      <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">
        <div className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/desserts.png')] bg-cover bg-center">
          <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
            Desserts
          </p>
        </div>
      </div>
      <div className="order-summary p-[24px] mt-0 pt-3 pb-5">
        {desertsCartItems.length > 0 ? (
          desertsCartItems.map((item, index) => (
            <div key={index} className="order-item mb-2">
              <span>
                <strong>Food:</strong> {item.name}
              </span>
              <br />
              <span>
                <strong>Quantity:</strong> {item.quantity}
              </span>
              <p>
                <strong>Modification:</strong> {item.modification}
              </p>
            </div>
          ))
        ) : (
          <p>No items in the order.</p>
        )}
      </div>
      {/* <div className="w-full p-[24px] gap-[1rem] columns-2">
        {meals.map((meal) => (
          <MealComponent
            key={meal.foodId}
            meal={meal}
            onMealClick={() => handleMealClick(meal)}
          />
        ))}
      </div> */}
      <div className="flex flex-wrap justify-between gap-4 p-[24px]">
        {meals.map((meal) => (
          <div
            className="flex-1 min-w-[9.85rem] max-w-[calc(50%-1rem)]"
            key={meal.foodId}
          >
            <MealComponent
              meal={meal}
              onMealClick={() => handleMealClick(meal)}
            />
          </div>
        ))}
      </div>

      {/* Show popup for selected meal */}
      {selectedMeal && (
        <MealPopup
          visibility={isPopupVisible ? "" : "hidden"}
          onClose={handleClosePopup}
          meal={selectedMeal}
          onAddToCart={handleAddToCart} // Pass the function to add meal to cart
        />
      )}

      <BottomNavBar />

      {/* Display current order */}
    </main>
  );
}
