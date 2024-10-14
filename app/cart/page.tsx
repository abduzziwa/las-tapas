// "use client";

// import React, { useState, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify"; // Import toast functions
// import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS
// import TopNavBar from "../components/TopNavBar";
// import BottomNavBar from "../components/BottomNavBar";

// interface CartItem {
//   foodId: string;
//   name: string;
//   quantity: number;
//   modification: string;
//   price: number;
//   category: string;
// }

// export default function Bill() {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   useEffect(() => {
//     // Load cart items from localStorage
//     const storedCartItems = localStorage.getItem("CartItems");
//     if (storedCartItems) {
//       setCartItems(JSON.parse(storedCartItems));
//     }
//   }, []);

//   // Helper function to update localStorage whenever cartItems state changes
//   const updateLocalStorage = (updatedCart: CartItem[]) => {
//     localStorage.setItem("CartItems", JSON.stringify(updatedCart));
//   };

//   // Function to handle increasing the quantity of an item
//   const increaseQuantity = (foodId: string) => {
//     const updatedCart = cartItems.map((item) =>
//       item.foodId === foodId ? { ...item, quantity: item.quantity + 1 } : item
//     );
//     setCartItems(updatedCart);
//     updateLocalStorage(updatedCart);
//   };

//   // Function to handle decreasing the quantity of an item
//   const decreaseQuantity = (foodId: string) => {
//     const updatedCart = cartItems
//       .map((item) =>
//         item.foodId === foodId && item.quantity > 1
//           ? { ...item, quantity: item.quantity - 1 }
//           : item
//       )
//       .filter((item) => item.quantity > 0); // Remove item if quantity goes to 0
//     setCartItems(updatedCart);
//     updateLocalStorage(updatedCart);
//   };

//   // Function to handle removing an item from the cart
//   const removeItem = (foodId: string) => {
//     const updatedCart = cartItems.filter((item) => item.foodId !== foodId);
//     setCartItems(updatedCart);
//     updateLocalStorage(updatedCart);
//   };

//   // Function to calculate the total price
//   const calculateTotal = () => {
//     return cartItems
//       .reduce((total, item) => total + item.price * item.quantity, 0)
//       .toFixed(2);
//   };

//   const submitOrder = async () => {
//     setIsSubmitting(true);
//     setSubmitError(null);

//     const sessionId = sessionStorage.getItem("sessionId");
//     const tableNumber = sessionStorage.getItem("TableNumber");

//     if (!sessionId || !tableNumber) {
//       setSubmitError("Session information is missing. Please try again.");
//       setIsSubmitting(false);
//       return;
//     }

//     const orderData = {
//       sessionId,
//       tableNumber,
//       foodItems: cartItems.map((item) => ({
//         foodId: item.foodId,
//         name: item.name,
//         quantity: item.quantity,
//         modification: item.modification || "",
//         price: item.price,
//         category: item.category,
//       })),
//     };

//     try {
//       const response = await fetch("/api/orders/newOrder", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(orderData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to submit order");
//       }

//       setCartItems([]);
//       localStorage.removeItem("CartItems");

//       // Show success toast
//       toast.success("Order submitted successfully!");
//     } catch (error) {
//       if (error instanceof Error) {
//         setSubmitError(
//           error.message || "Failed to submit order. Please try again."
//         );
//       } else {
//         setSubmitError("Failed to submit order. Please try again.");
//       }

//       // Show error toast
//       toast.error(submitError || "Error submitting order. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <main className="flex flex-col min-h-screen">
//       <TopNavBar />

//       {/* ToastContainer must be added to your component tree */}
//       <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

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

//                     <div className="flex items-center gap-2 mt-2">
//                       <button
//                         className="bg-gray-300 text-gray-800 py-1 px-2 rounded"
//                         onClick={() => decreaseQuantity(item.foodId)}
//                       >
//                         -
//                       </button>
//                       <span>{item.quantity}</span>
//                       <button
//                         className="bg-gray-300 text-gray-800 py-1 px-2 rounded"
//                         onClick={() => increaseQuantity(item.foodId)}
//                       >
//                         +
//                       </button>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-lg font-semibold">
//                       €{(item.price * item.quantity).toFixed(2)}
//                     </p>
//                     <p className="text-sm text-gray-500">€{item.price} each</p>
//                     <button
//                       className="text-red-600 mt-2 text-sm"
//                       onClick={() => removeItem(item.foodId)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//             <div className="p-4 bg-gray-50">
//               <div className="flex justify-between items-center mb-4">
//                 <span className="text-xl font-bold">Total:</span>
//                 <span className="text-xl font-bold">€{calculateTotal()}</span>
//               </div>
//               <button
//                 className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
//                 onClick={submitOrder}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "Submitting..." : "Submit Order"}
//               </button>
//               {submitError && (
//                 <p className="text-red-500 mt-2">{submitError}</p>
//               )}
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar"; // Import the modal
import ConfirmationModal from "../components/ConfirmationModel";
import AuthGuard from "../components/AuthGuard";

interface CartItem {
  foodId: string;
  name: string;
  quantity: number;
  modification: string;
  price: number;
  category: string;
}

export default function Bill() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    const storedCartItems = localStorage.getItem("CartItems");
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  const updateLocalStorage = (updatedCart: CartItem[]) => {
    localStorage.setItem("CartItems", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (foodId: string) => {
    const updatedCart = cartItems.map((item) =>
      item.foodId === foodId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
    updateLocalStorage(updatedCart);
  };

  const decreaseQuantity = (foodId: string) => {
    const updatedCart = cartItems
      .map((item) =>
        item.foodId === foodId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(updatedCart);
    updateLocalStorage(updatedCart);
  };

  const removeItem = (foodId: string) => {
    const updatedCart = cartItems.filter((item) => item.foodId !== foodId);
    setCartItems(updatedCart);
    updateLocalStorage(updatedCart);
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // Function to submit order
  const submitOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const sessionId = sessionStorage.getItem("sessionId");
    const tableNumber = sessionStorage.getItem("tableNumber");

    if (!sessionId || !tableNumber) {
      setSubmitError("Session information is missing. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      sessionId,
      tableNumber,
      foodItems: cartItems.map((item) => ({
        foodId: item.foodId,
        name: item.name,
        quantity: item.quantity,
        modification: item.modification || "",
        price: item.price,
        category: item.category,
      })),
    };

    try {
      const response = await fetch("/api/orders/newOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit order");
      }

      setCartItems([]);
      localStorage.removeItem("CartItems");
      toast.success("Order submitted successfully!");
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(
          error.message || "Failed to submit order. Please try again."
        );
      } else {
        setSubmitError("Failed to submit order. Please try again.");
      }
      toast.error(submitError || "Error submitting order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle submission confirmation
  const handleConfirmSubmit = () => {
    setIsModalOpen(false);
    submitOrder(); // Call submit order function
  };

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-screen">
        <TopNavBar />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
        />

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSubmit}
        />

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
                      <p className="text-sm text-gray-500">
                        €{item.price} each
                      </p>
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
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-xl font-bold">€{calculateTotal()}</span>
                </div>
                <button
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  onClick={() => setIsModalOpen(true)} // Open the modal
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Order"}
                </button>
                {submitError && (
                  <p className="text-red-500 mt-2">{submitError}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Your cart is empty</p>
          )}
        </div>
        <BottomNavBar />
      </main>
    </AuthGuard>
  );
}
