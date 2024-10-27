// "use client";

// import React, { useState, useEffect } from "react";
// import TopNavBar from "../components/TopNavBar";
// import BottomNavBar from "../components/BottomNavBar";
// import DropDownArrow from "../../public/dropdownarrow.svg";
// import Image from "next/image";
// import AuthGuard from "../components/AuthGuard";
// import { endpoints } from "../api/endpoint";

// interface BillItem {
//   foodId: string;
//   name: string;
//   quantity: number;
//   modification: string;
//   price: number;
//   category?: string;
// }

// interface Order {
//   orderId: string;
//   foodItems: BillItem[];
//   payment: string;
//   // add other fields as needed
// }

// type Category = "food" | "drink" | "dessert";

// export default function Bill() {
//   const [BillItems, setBillItems] = useState<BillItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedCategories, setExpandedCategories] = useState<
//     Record<Category, boolean>
//   >({
//     food: false,
//     drink: false,
//     dessert: false,
//   });

//   useEffect(() => {
//     const fetchBillItems = async () => {
//       try {
//         const sessionId = sessionStorage.getItem("sessionId");
//         if (!sessionId) {
//           throw new Error("No session ID found");
//         }

//         const response = await fetch(
//           `http://${endpoints.next_ip_port}/api/orders/clientOrderlistOrdered?sessionId=${sessionId}`
//         );

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || "Failed to fetch orders");
//         }

//         const orders: Order[] = await response.json();

//         // Filter unpaid orders and extract their food items
//         const unpaidFoodItems = orders
//           .filter((order) => order.payment === "unpaid")
//           .flatMap((order) => order.foodItems);

//         // Set the extracted food items directly to BillItems state
//         setBillItems(unpaidFoodItems);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "An unknown error occurred"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBillItems();
//   }, []); // Empty dependency array means this runs once on mount

//   const toggleCategory = (category: Category) => {
//     setExpandedCategories((prev) => ({
//       ...prev,
//       [category]: !prev[category],
//     }));
//   };

//   const filterItemsByCategory = (category: Category): BillItem[] => {
//     return BillItems.filter((item) => item.category === category);
//   };

//   const calculateTotal = (items: BillItem[]): string => {
//     return items
//       .reduce((total, item) => total + item.price * item.quantity, 0)
//       .toFixed(2);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   const totalFood = calculateTotal(filterItemsByCategory("food"));
//   const totalDrinks = calculateTotal(filterItemsByCategory("drink"));
//   const totalDesserts = calculateTotal(filterItemsByCategory("dessert"));
//   const grandTotal = (
//     parseFloat(totalFood) +
//     parseFloat(totalDrinks) +
//     parseFloat(totalDesserts)
//   ).toFixed(2);

//   const renderCategorySection = (category: Category, total: string) => (
//     <>
//       <div className="flex w-full justify-between items-center">
//         <div
//           className="flex gap-[10px] items-center cursor-pointer"
//           onClick={() => toggleCategory(category)}
//         >
//           <Image
//             className={`w-fit h-fit transform ${
//               expandedCategories[category] ? "rotate-180" : ""
//             }`}
//             src={DropDownArrow.src}
//             width={20}
//             height={20}
//             alt="dropdownarrow"
//           />
//           <p className="font-bold text-2xl">
//             Total {category.charAt(0).toUpperCase() + category.slice(1)}
//           </p>
//         </div>
//         <div>
//           <p>€{total}</p>
//         </div>
//       </div>
//       {expandedCategories[category] && (
//         <div className="w-full pl-4">
//           {filterItemsByCategory(category).map((item, index) => (
//             <div key={index} className="flex justify-between">
//               <p>
//                 {item.name} x{item.quantity}
//               </p>
//               <p>€{(item.price * item.quantity).toFixed(2)}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );

//   return (
//     <AuthGuard>
//       <main className="flex flex-col min-h-screen">
//         <TopNavBar />
//         <div className="flex flex-col items-center justify-center w-full flex-grow px-[14px] py-[24px] gap-[14px]">
//           <h1 className="leading-tight text-[24px]">Bill</h1>

//           {renderCategorySection("food", totalFood)}
//           {renderCategorySection("drink", totalDrinks)}
//           {renderCategorySection("dessert", totalDesserts)}

//           <div className="flex w-full justify-end items-center gap-[6px]">
//             <p>Total:</p>
//             <p>€{grandTotal}</p>
//           </div>
//           <div>
//             <button
//               onClick={() => console.log("Clicked..")}
//               className="flex py-[12px] px-[14px] bg-main rounded-full text-white"
//             >
//               💸I want to pay💸
//             </button>
//           </div>
//         </div>
//         <BottomNavBar />
//       </main>
//     </AuthGuard>
//   );
// }

// "use client";

// import React, { useState, useEffect } from "react";
// import TopNavBar from "../components/TopNavBar";
// import BottomNavBar from "../components/BottomNavBar";
// import DropDownArrow from "../../public/dropdownarrow.svg";
// import Image from "next/image";
// import AuthGuard from "../components/AuthGuard";
// import { endpoints } from "../api/endpoint";
// import { toast } from "react-toastify";

// interface BillItem {
//   foodId: string;
//   name: string;
//   quantity: number;
//   modification: string;
//   price: number;
//   category?: Category;
// }

// interface Order {
//   orderId: string;
//   foodItems: BillItem[];
//   payment: "paid" | "unpaid";
// }

// type Category = "food" | "drink" | "dessert";

// const CATEGORIES: Category[] = ["food", "drink", "dessert"];

// export default function Bill() {
//   const [billItems, setBillItems] = useState<BillItem[]>([]);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
//   const [expandedCategories, setExpandedCategories] = useState<
//     Record<Category, boolean>
//   >(
//     Object.fromEntries(CATEGORIES.map((cat) => [cat, false])) as Record<
//       Category,
//       boolean
//     >
//   );

//   const fetchBillItems = async (sessionId: string) => {
//     const response = await fetch(
//       `http://${endpoints.next_ip_port}/api/orders/clientOrderlistOrdered?sessionId=${sessionId}`
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to fetch orders");
//     }

//     return response.json();
//   };

//   useEffect(() => {
//     const initializeBillItems = async () => {
//       try {
//         const sessionId = sessionStorage.getItem("sessionId");
//         if (!sessionId) {
//           throw new Error("No session ID found");
//         }

//         const fetchedOrders: Order[] = await fetchBillItems(sessionId);
//         setOrders(fetchedOrders);

//         const unpaidFoodItems = fetchedOrders
//           .filter((order) => order.payment === "unpaid")
//           .flatMap((order) => order.foodItems);

//         setBillItems(unpaidFoodItems);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "An unknown error occurred"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeBillItems();
//   }, []);

//   const handlePayRequest = async () => {
//     try {
//       setIsPaymentProcessing(true);
//       const sessionId = sessionStorage.getItem("sessionId");

//       if (!sessionId) {
//         throw new Error("No session ID found");
//       }

//       const unpaidOrderIds = orders
//         .filter((order) => order.payment === "unpaid")
//         .map((order) => order.orderId);

//       if (unpaidOrderIds.length === 0) {
//         throw new Error("No unpaid orders found");
//       }

//       const response = await fetch(
//         `http://${
//           endpoints.next_ip_port
//         }/api/orders/iwantToPay?orderIds=${unpaidOrderIds.join(",")}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ sessionId }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         // throw new Error(errorData.message || "Failed to process payment");
//         toast.error(errorData.message);
//       }

//       // Refresh bill items after successful payment
//       const updatedOrders = await fetchBillItems(sessionId);
//       setOrders(updatedOrders);

//       const updatedUnpaidFoodItems = updatedOrders
//         .filter((order: Order) => order.payment === "unpaid")
//         .flatMap((order: Order) => order.foodItems);

//       setBillItems(updatedUnpaidFoodItems);
//       toast.success("Payment request sent successfully!");
//       // alert("Payment request sent successfully!");
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : "An unknown error occurred during payment";
//       setError(errorMessage);
//       toast.error("OOPS: " + errorMessage);
//       // alert(`Failed to send payment request: ${errorMessage}`);
//     } finally {
//       setIsPaymentProcessing(false);
//     }
//   };

//   const toggleCategory = (category: Category) => {
//     setExpandedCategories((prev) => ({
//       ...prev,
//       [category]: !prev[category],
//     }));
//   };

//   const filterItemsByCategory = (category: Category): BillItem[] => {
//     return billItems.filter((item) => item.category === category);
//   };

//   const calculateTotal = (items: BillItem[]): number => {
//     return Number(
//       items
//         .reduce((total, item) => total + item.price * item.quantity, 0)
//         .toFixed(2)
//     );
//   };

//   const CategorySection: React.FC<{ category: Category; total: number }> = ({
//     category,
//     total,
//   }) => (
//     <div className="w-full space-y-2">
//       <div className="flex justify-between items-center">
//         <button
//           className="flex gap-[10px] items-center"
//           onClick={() => toggleCategory(category)}
//         >
//           <span className="hidden">none</span>
//           <Image
//             className={`transform transition-transform ${
//               expandedCategories[category] ? "rotate-180" : ""
//             }`}
//             src={DropDownArrow.src}
//             width={20}
//             height={20}
//             alt={`Toggle ${category} details`}
//           />
//           <p className="font-bold text-2xl capitalize">Total {category}</p>
//         </button>
//         <p>€{total.toFixed(2)}</p>
//       </div>
//       {expandedCategories[category] && (
//         <div className="w-full pl-4 space-y-1">
//           {filterItemsByCategory(category).map((item) => (
//             <div key={item.foodId} className="flex justify-between">
//               <p>
//                 {item.name} x{item.quantity}
//                 {item.modification && ` (${item.modification})`}
//               </p>
//               <p>€{(item.price * item.quantity).toFixed(2)}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-lg">Loading your bill...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-red-600">Error: {error}</p>
//       </div>
//     );
//   }

//   const categoriesTotal = CATEGORIES.map((category) => ({
//     category,
//     total: calculateTotal(filterItemsByCategory(category)),
//   }));

//   const grandTotal = categoriesTotal.reduce((sum, { total }) => sum + total, 0);

//   return (
//     <AuthGuard>
//       <main className="flex flex-col min-h-screen">
//         <TopNavBar />
//         <div className="flex flex-col items-center justify-center w-full flex-grow px-4 py-6 gap-4">
//           <h1 className="text-2xl font-bold">Bill</h1>

//           {categoriesTotal.map(({ category, total }) => (
//             <CategorySection key={category} category={category} total={total} />
//           ))}

//           <div className="flex w-full justify-end items-center gap-2">
//             <p className="font-bold">Total:</p>
//             <p className="font-bold">€{grandTotal.toFixed(2)}</p>
//           </div>

//           <button
//             disabled={isPaymentProcessing || billItems.length === 0}
//             onClick={handlePayRequest}
//             className={`
//               flex py-3 px-4 rounded-full text-white transition-colors
//               ${
//                 isPaymentProcessing || billItems.length === 0
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-main hover:bg-main/90"
//               }
//             `}
//           >
//             {isPaymentProcessing
//               ? "Processing..."
//               : billItems.length === 0
//               ? "No items to pay"
//               : "Or ask a waiter to pay cash"}
//           </button>
//         </div>
//         <BottomNavBar />
//       </main>
//     </AuthGuard>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import DropDownArrow from "../../public/dropdownarrow.svg";
import Image from "next/image";
import AuthGuard from "../components/AuthGuard";
import { endpoints } from "../api/endpoint";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BillItem {
  foodId: string;
  name: string;
  quantity: number;
  modification: string;
  price: number;
  category?: Category;
}

interface Order {
  orderId: string;
  foodItems: BillItem[];
  payment: "paid" | "unpaid";
}

type Category = "food" | "drink" | "dessert";

const CATEGORIES: Category[] = ["food", "drink", "dessert"];

export default function Bill() {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<Category, boolean>
  >(
    Object.fromEntries(CATEGORIES.map((cat) => [cat, false])) as Record<
      Category,
      boolean
    >
  );

  const fetchBillItems = async (sessionId: string) => {
    try {
      const response = await fetch(
        `http://${endpoints.next_ip_port}/api/orders/clientOrderlistOrdered?sessionId=${sessionId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch orders");
        return null;
      }

      return response.json();
    } catch (error) {
      toast.error("Failed to fetch bill items. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    const initializeBillItems = async () => {
      try {
        const sessionId = sessionStorage.getItem("sessionId");
        if (!sessionId) {
          toast.error("No session found. Please try logging in again.");
          return;
        }

        const fetchedOrders = await fetchBillItems(sessionId);
        if (fetchedOrders) {
          setOrders(fetchedOrders);
          const unpaidFoodItems = fetchedOrders
            .filter((order: Order) => order.payment === "unpaid")
            .flatMap((order: Order) => order.foodItems);
          setBillItems(unpaidFoodItems);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeBillItems();
  }, []);

  const handlePayRequest = async () => {
    try {
      setIsPaymentProcessing(true);
      const sessionId = sessionStorage.getItem("sessionId");

      if (!sessionId) {
        toast.error("No session found. Please try logging in again.");
        return;
      }

      const unpaidOrderIds = orders
        .filter((order) => order.payment === "unpaid")
        .map((order) => order.orderId);

      if (unpaidOrderIds.length === 0) {
        toast.warning("No unpaid orders found.");
        return;
      }

      const response = await fetch(
        `http://${
          endpoints.next_ip_port
        }/api/orders/iwantToPay?orderIds=${unpaidOrderIds.join(",")}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.message || "Failed to process payment");
        return;
      }

      // Only refresh the bill items if the payment request was successful
      const updatedOrders = await fetchBillItems(sessionId);
      if (updatedOrders) {
        setOrders(updatedOrders);
        const updatedUnpaidFoodItems = updatedOrders
          .filter((order: Order) => order.payment === "unpaid")
          .flatMap((order: Order) => order.foodItems);
        setBillItems(updatedUnpaidFoodItems);
      }
      toast.success("Payment request sent successfully!");
    } catch (err) {
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const toggleCategory = (category: Category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const filterItemsByCategory = (category: Category): BillItem[] => {
    return billItems.filter((item) => item.category === category);
  };

  const calculateTotal = (items: BillItem[]): number => {
    return Number(
      items
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2)
    );
  };

  const CategorySection: React.FC<{ category: Category; total: number }> = ({
    category,
    total,
  }) => (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <button
          className="flex gap-[10px] items-center"
          onClick={() => toggleCategory(category)}
        >
          <span className="hidden">none</span>
          <Image
            className={`transform transition-transform ${
              expandedCategories[category] ? "rotate-180" : ""
            }`}
            src={DropDownArrow.src}
            width={20}
            height={20}
            alt={`Toggle ${category} details`}
          />
          <p className="font-bold text-2xl capitalize">Total {category}</p>
        </button>
        <p>€{total.toFixed(2)}</p>
      </div>
      {expandedCategories[category] && (
        <div className="w-full pl-4 space-y-1">
          {filterItemsByCategory(category).map((item) => (
            <div key={item.foodId} className="flex justify-between">
              <p>
                {item.name} x{item.quantity}
                {item.modification && ` (${item.modification})`}
              </p>
              <p>€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <AuthGuard>
        <main className="flex min-h-screen items-center justify-center">
          <TopNavBar />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
          />
          <p className="text-lg">Loading your bill...</p>
          <BottomNavBar />
        </main>
      </AuthGuard>
    );
  }

  const categoriesTotal = CATEGORIES.map((category) => ({
    category,
    total: calculateTotal(filterItemsByCategory(category)),
  }));

  const grandTotal = categoriesTotal.reduce((sum, { total }) => sum + total, 0);

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-screen">
        <TopNavBar />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
        />

        <div className="flex flex-col items-center justify-center w-full flex-grow px-4 py-6 gap-4">
          <h1 className="text-2xl font-bold">Bill</h1>

          {categoriesTotal.map(({ category, total }) => (
            <CategorySection key={category} category={category} total={total} />
          ))}

          <div className="flex w-full justify-end items-center gap-2">
            <p className="font-bold">Total:</p>
            <p className="font-bold">€{grandTotal.toFixed(2)}</p>
          </div>

          <button
            disabled={isPaymentProcessing || billItems.length === 0}
            onClick={handlePayRequest}
            className={`
              flex py-3 px-4 rounded-full text-white transition-colors
              ${
                isPaymentProcessing || billItems.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-main hover:bg-main/90"
              }
            `}
          >
            {isPaymentProcessing
              ? "Processing..."
              : billItems.length === 0
              ? "No items to pay"
              : "Request to pay"}
          </button>
        </div>
        <BottomNavBar />
      </main>
    </AuthGuard>
  );
}
