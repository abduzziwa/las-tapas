// "use client";
// import React, { useState, useEffect } from "react";
// import TopNavBar from "../components/TopNavBar";
// import BottomNavBar from "../components/BottomNavBar";

// interface CartItem {
//   foodId: string;
//   name: string;
//   quantity: number;
//   modification: string;
//   price: number;
// }

// export default function Bill() {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   useEffect(() => {
//     // Check if CartItems exist in localStorage
//     const storedCartItems = localStorage.getItem("CartItems");

//     if (storedCartItems) {
//       // If cart exists, load the items into state
//       setCartItems(JSON.parse(storedCartItems));
//     } else {
//       // If no cart exists, initialize an empty array in localStorage
//       const initialCartItems: CartItem[] = [];
//       localStorage.setItem("CartItems", JSON.stringify(initialCartItems));
//       setCartItems(initialCartItems);
//     }
//   }, []);

//   const calculateTotal = () => {
//     return cartItems
//       .reduce((total, item) => total + item.price * item.quantity, 0)
//       .toFixed(2);
//   };

//   return (
//     <main className="flex flex-col min-h-screen">
//       <TopNavBar />
//       <div className="flex-grow p-4">
//         <h1 className="text-2xl font-bold mb-4">Your Order</h1>
//         {cartItems.length > 0 ? (
//           <div className="bg-white shadow-md rounded-lg overflow-hidden">
//             <ul className="divide-y divide-gray-200">
//               {cartItems.map((item, index) => (
//                 <li
//                   key={index}
//                   className="p-4 flex justify-between items-center"
//                 >
//                   <div>
//                     <h3 className="text-lg font-semibold">{item.name}</h3>
//                     <p className="text-gray-600">Quantity: {item.quantity}</p>
//                     {item.modification !== "none" && (
//                       <p className="text-sm text-gray-500">
//                         Note: {item.modification}
//                       </p>
//                     )}
//                   </div>
//                   <div className="text-right">
//                     <p className="text-lg font-semibold">
//                       €{(item.price * item.quantity).toFixed(2)}
//                     </p>
//                     <p className="text-sm text-gray-500">€{item.price} each</p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//             <div className="p-4 bg-gray-50">
//               <div className="flex justify-between items-center">
//                 <span className="text-xl font-bold">Total:</span>
//                 <span className="text-xl font-bold">€{calculateTotal()}</span>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p className="text-center text-gray-500">Your cart is empty</p>
//         )}
//       </div>
//       <BottomNavBar />
//     </main>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";

interface CartItem {
  foodId: string;
  name: string;
  quantity: number;
  modification: string;
  price: number;
}

export default function Bill() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart items from localStorage
    const storedCartItems = localStorage.getItem("CartItems");
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  // Helper function to update localStorage whenever cartItems state changes
  const updateLocalStorage = (updatedCart: CartItem[]) => {
    localStorage.setItem("CartItems", JSON.stringify(updatedCart));
  };

  // Function to handle increasing the quantity of an item
  const increaseQuantity = (foodId: string) => {
    const updatedCart = cartItems.map((item) =>
      item.foodId === foodId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
    updateLocalStorage(updatedCart);
  };

  // Function to handle decreasing the quantity of an item
  const decreaseQuantity = (foodId: string) => {
    const updatedCart = cartItems
      .map((item) =>
        item.foodId === foodId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0); // Remove item if quantity goes to 0
    setCartItems(updatedCart);
    updateLocalStorage(updatedCart);
  };

  // Function to handle removing an item from the cart
  const removeItem = (foodId: string) => {
    const updatedCart = cartItems.filter((item) => item.foodId !== foodId);
    setCartItems(updatedCart);
    updateLocalStorage(updatedCart);
  };

  // Function to calculate the total price
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <main className="flex flex-col min-h-screen">
      <TopNavBar />
      <div className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4">Your Order</h1>
        {cartItems.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item, index) => (
                <li
                  key={index}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    {item.modification !== "none" && (
                      <p className="text-sm text-gray-500">
                        Note: {item.modification}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="bg-gray-300 text-gray-800 py-1 px-2 rounded"
                        onClick={() => decreaseQuantity(item.foodId)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="bg-gray-300 text-gray-800 py-1 px-2 rounded"
                        onClick={() => increaseQuantity(item.foodId)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">€{item.price} each</p>
                    <button
                      className="text-red-600 mt-2 text-sm"
                      onClick={() => removeItem(item.foodId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-xl font-bold">€{calculateTotal()}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Your cart is empty</p>
        )}
      </div>
      <BottomNavBar />
    </main>
  );
}
