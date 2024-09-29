// "use client";
// import React from "react";
// import CloseIcon from "../../public/close-icon.svg";
// import MealImage from "../../public/food.png";

// interface Meal {
//   id: string;
//   name: string;
//   description: string;
//   image: string;
//   allergies: string[];
//   price: number;
// }

// interface Props {
//   visibility: "hidden" | "";
//   onClose: () => void;
//   meal: Meal;
// }

// const MealPopup: React.FC<Props> = ({ visibility = "", onClose, meal }) => {
//   return (
//     <div
//       className={
//         visibility +
//         " absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center"
//       }
//       style={{ caretColor: "transparent" }}
//     >
//       <div className="flex flex-col z-10 w-[345px] h-[235px] bg-gradient-to-tr from-main to-gradientEnd rounded-[20px] drop-shadow-lg">
//         <div className="flex flex-row justify-between items-center w-full h-fit pt-[12px] px-[20px]">
//           <p className="text-white text-[16px] leading-tight font-bold">
//             Table : 4
//           </p>
//           <img
//             className="w-[16px] h-[16px] cursor-pointer"
//             src={CloseIcon.src}
//             alt="close-icon"
//             onClick={onClose}
//           />
//         </div>
//         <div className="flex w-full h-full px-[20px] py-[8px] gap-[8px]">
//           <img
//             src={MealImage.src}
//             alt={meal.name}
//             className="w-40 h-28 rounded-[20px] object-cover object-center"
//           />
//           <div className="px-[10px] py-10px] gap-[12px]">
//             <p className="text-white text-[20px] leading-tight font-light">
//               {meal.name}
//             </p>
//             <p className="text-white text-[12px] leading-tight font-light">
//               {meal.description}
//             </p>
//             <p className="text-white text-[14px] leading-tight font-bold mt-2">
//               ${meal.price.toFixed(2)}
//             </p>
//           </div>
//         </div>
//         <input
//           type="text"
//           className="mt-0 mb-1 ml-2 mr-2 border-1 border-red-500 rounded-[20px] w-[300px] h-[40px] px-[12px] py-[10px] text-black text-[12px] leading-tight font-light"
//           placeholder="   Any modifications ?"
//         />
//         <div className="flex flex-row w-full h-fit items-center justify-between px-[20px] pb-[12px]">
//           <p className="text-white text-[12px] leading-tight font-light">
//             Allergies: {meal.allergies.join(", ")}
//           </p>
//           <p className="text-white text-xl">x {0}</p>
//           <button className="px-[12px] py-[10px] bg-white rounded-full text-[12px] leading-tight font-light">
//             Add to cart
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MealPopup;
"use client";
import React, { useState } from "react";
import CloseIcon from "../../public/close-icon.svg";
import MealImage from "../../public/food.png";
import { Meal } from "../menu/foods/page";
import Image from "next/image";

// Define Meal interface
interface Props {
  visibility: "hidden" | ""; // Control visibility
  onClose: () => void; // Close the popup
  meal: Meal; // The meal data being passed in
  onAddToCart: (mealData: {
    foodId: string;
    foodName: string;
    quantity: number;
    foodPrice: number;
    modification: string;
  }) => void; // Callback for adding meal to cart
}

const MealPopup: React.FC<Props> = ({
  visibility = "",
  onClose,
  meal,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1); // State for quantity
  const [modification, setModification] = useState(""); // State for modification input

  // Function to handle incrementing the quantity
  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Function to handle decrementing the quantity (minimum of 1)
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Function to handle adding the selected meal to the cart
  const handleAddToCart = () => {
    onAddToCart({
      foodId: meal.foodId,
      foodName: meal.name,
      foodPrice: meal.price,
      quantity,
      modification: modification || "none", // Default to "none" if no modification is added
    });
    onClose(); // Close the popup after adding to cart
  };

  return (
    <div
      className={`${visibility} fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50`}
    >
      <div className="relative w-[90%] max-w-[400px] bg-gradient-to-tr from-main to-gradientEnd rounded-[20px] p-6 drop-shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white cursor-pointer"
        >
          <Image src={CloseIcon.src} alt="close-icon" width={16} height={16} />.
        </button>

        {/* Meal Image and Details */}
        <div className="flex gap-4 mb-4">
          <Image
            src={MealImage.src}
            alt={meal.name}
            width={120}
            height={120}
            className="object-cover object-center w-32 h-32 rounded-[20px]"
          />
          <div className="flex flex-col justify-between">
            <h3 className="text-white text-[20px] font-bold leading-tight">
              {meal.name}
            </h3>
            {meal.ingredients.length > 0 ? (
              <p className="text-white text-[14px] font-light">
                <span className="font-bold italic underline">Ingredients</span>:{" "}
                {meal.ingredients.join(", ")}
              </p>
            ) : (
              <p className="text-white text-[14px] font-light">
                <span className="font-bold italic underline">Discription:</span>
                : {meal.description}
              </p>
            )}
            <p className="text-white text-[16px] font-bold mt-2">
              ${meal.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Modification input */}
        <input
          type="text"
          className="w-full h-[40px] px-4 py-2 text-sm rounded-[12px] mb-4 border border-gray-300"
          placeholder="Any modifications?"
          value={modification}
          onChange={(e) => setModification(e.target.value)} // Update modification input
        />

        {/* Quantity Controls and Add to Cart Button */}
        <div className="flex justify-between items-center">
          {/* Quantity controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleDecreaseQuantity}
              className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center"
            >
              -
            </button>
            <p className="text-white text-lg font-bold">x {quantity}</p>
            <button
              onClick={handleIncreaseQuantity}
              className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center"
            >
              +
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealPopup;
