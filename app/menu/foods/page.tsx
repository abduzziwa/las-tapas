// "use client";
// import React, { useState } from "react";
// import TopNavBar from "../../components/TopNavBar";
// import BottomNavBar from "../../components/BottomNavBar";
// import MealComponent from "../../components/MealComponent";
// import MealPopup from "@/app/components/MealPopup";

// export interface Meal {
//   foodId: string;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
//   ingredients: string[];
//   halal: boolean;
//   vegetarian: boolean;
//   countryOfOrigin: string;`
//   imageUrl: string;
//   createdAt: {
//     $date: string;
//   };
// }

// interface OrderItem {
//   foodId: string;
//   name: string;
//   quantity: number;
//   modification: string;
// }

// const mockMeals: Meal[] = [
//   {
//     foodId: "food001",
//     name: "Stamppot",
//     description: "Traditional Dutch dish with mashed potatoes and vegetables",
//     price: 12.5,
//     category: "food",
//     ingredients: ["potatoes", "kale", "carrots", "onions", "smoked sausage"],
//     halal: false,
//     vegetarian: false,
//     countryOfOrigin: "Netherlands",
//     imageUrl: "https://example.com/stamppot.jpg",
//     createdAt: {
//       $date: "2024-09-17T10:38:29.282Z",
//     },
//   },
// ];

// export default function Foods() {
//   const [isPopupVisible, setIsPopupVisible] = useState(false);
//   const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
//   const [cartItems, setCartItems] = useState<OrderItem[]>([]); // State to store the cart items

//   // Handle opening the meal popup when a meal is clicked
//   const handleMealClick = (meal: Meal) => {
//     setSelectedMeal(meal);
//     setIsPopupVisible(true);
//   };

//   // Handle closing the meal popup
//   const handleClosePopup = () => {
//     setIsPopupVisible(false);
//     setSelectedMeal(null);
//   };

//   // Handle adding a meal to the cart
//   const handleAddToCart = (mealData: {
//     foodId: string;
//     foodName: string;
//     quantity: number;
//     foodPrice: number;
//     modification: string;
//   }) => {
//     const newOrderItem: OrderItem = {
//       foodId: mealData.foodId,
//       name: mealData.foodName,
//       quantity: mealData.quantity,
//       modification: mealData.modification,
//     };
//     // Add the new meal to the cartItems array
//     setCartItems((prevItems) => [...prevItems, newOrderItem]);
//   };
//   console.log(cartItems);
//   return (
//     <main>
//       <TopNavBar />

//       <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">
//         <div className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/food.png')] bg-cover bg-center">
//           <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
//             Food
//           </p>
//         </div>
//       </div>

//       <div className="w-full p-[24px] gap-[10px]">
//         {mockMeals.map((meal) => (
//           <MealComponent
//             key={meal.foodId}
//             meal={meal}
//             onMealClick={() => handleMealClick(meal)}
//           />
//         ))}
//       </div>

//       {/* Show popup for selected meal */}
//       {selectedMeal && (
//         <MealPopup
//           visibility={isPopupVisible ? "" : "hidden"}
//           onClose={handleClosePopup}
//           meal={selectedMeal}
//           onAddToCart={handleAddToCart} // Pass the function to add meal to cart
//         />
//       )}

//       <BottomNavBar />

//       {/* Display current order */}
//       <div className="order-summary p-[24px]">
//         {cartItems.length > 0 ? (
//           cartItems.map((item, index) => (
//             <div key={index} className="order-item mb-2">
//               <p>
//                 <strong>Food:</strong> {item.name}
//               </p>
//               <p>
//                 <strong>Quantity:</strong> {item.quantity}
//               </p>
//               <p>
//                 <strong>Modification:</strong> {item.modification}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p>No items in the order.</p>
//         )}
//       </div>
//     </main>
//   );
// }
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
  const [cartItems, setCartItems] = useState<OrderItem[]>([]); // State to store the cart items

  // Fetch meals from the API on component mount
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch(
          "http://192.168.178.12:3000/api/menu/foods"
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
    setCartItems((prevItems) => [...prevItems, newOrderItem]);
  };

  console.log(cartItems);

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
      <div className="order-summary p-[24px]">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={index} className="order-item mb-2">
              <p>
                <strong>Food:</strong> {item.name}
              </p>
              <p>
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p>
                <strong>Modification:</strong> {item.modification}
              </p>
            </div>
          ))
        ) : (
          <p>No items in the order.</p>
        )}
      </div>
    </main>
  );
}
