// "use client";
// import React, { useState, useEffect } from "react";
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
//   countryOfOrigin: string;
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

// export default function Foods() {
//   const [meals, setMeals] = useState<Meal[]>([]);
//   const [isPopupVisible, setIsPopupVisible] = useState(false);
//   const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
//   const [cartItems, setCartItems] = useState<OrderItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Load cart items from localStorage on component mount
//   useEffect(() => {
//     const storedCartItems = localStorage.getItem("CartItems");
//     if (storedCartItems) {
//       setCartItems(JSON.parse(storedCartItems));
//     }
//   }, []);

//   // Update localStorage whenever cartItems changes
//   useEffect(() => {
//     localStorage.setItem("CartItems", JSON.stringify(cartItems));
//   }, [cartItems]);

//   useEffect(() => {
//     const fetchMeals = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(
//           "http://192.168.231.119:3000/api/menu/foods"
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch meals");
//         }
//         const data: Meal[] = await response.json();
//         setMeals(data);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchMeals();
//   }, []);

//   const handleMealClick = (meal: Meal) => {
//     setSelectedMeal(meal);
//     setIsPopupVisible(true);
//   };

//   const handleClosePopup = () => {
//     setIsPopupVisible(false);
//     setSelectedMeal(null);
//   };

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
//     setCartItems((prevItems) => [...prevItems, newOrderItem]);
//   };

//   return (
//     <main>
//       <TopNavBar />

//       <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">
//         <div className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/drinks.png')] bg-cover bg-center">
//           <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
//             Drinks
//           </p>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
//         </div>
//       ) : (
//         <div className="flex flex-wrap justify-between gap-4 p-[24px]">
//           {meals.map((meal) => (
//             <div
//               className="flex-1 min-w-[9.85rem] max-w-[calc(50%-1rem)]"
//               key={meal.foodId}
//             >
//               <MealComponent
//                 meal={meal}
//                 onMealClick={() => handleMealClick(meal)}
//               />
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedMeal && (
//         <MealPopup
//           visibility={isPopupVisible ? "" : "hidden"}
//           onClose={handleClosePopup}
//           meal={selectedMeal}
//           onAddToCart={handleAddToCart}
//         />
//       )}

//       <BottomNavBar />

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
  price: number;
}

export default function Foods() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if cart items exist in localStorage without initializing an empty array
  useEffect(() => {
    const storedCartItems = localStorage.getItem("CartItems");
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  // Update localStorage whenever cartItems changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("CartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Fetch meal data from the API
  useEffect(() => {
    const fetchMeals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://192.168.231.119:3000/api/menu/drinks"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch meals");
        }
        const data: Meal[] = await response.json();
        setMeals(data);
      } catch (error) {
        console.error("Error fetching meals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, []);

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
      price: mealData.foodPrice,
    };

    // Add new item to the cartItems array
    setCartItems((prevItems) => [...prevItems, newOrderItem]);
  };

  // Handle opening the meal popup
  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsPopupVisible(true);
  };

  // Handle closing the meal popup
  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setSelectedMeal(null);
  };

  return (
    <main>
      <TopNavBar />

      <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">
        <div className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/drinks.png')] bg-cover bg-center">
          <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
            Drinks
          </p>
        </div>
      </div>

      {/* Loading state while fetching meals */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
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
      )}

      {/* Popup for selected meal */}
      {selectedMeal && (
        <MealPopup
          visibility={isPopupVisible ? "" : "hidden"}
          onClose={handleClosePopup}
          meal={selectedMeal}
          onAddToCart={handleAddToCart}
        />
      )}

      <BottomNavBar />

      {/* Display current cart items */}
      {/* <div className="order-summary p-[24px]">
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
          <p>No items in the cart.</p>
        )}
      </div> */}
    </main>
  );
}
