// import TopNavBar from "../components/TopNavBar"; // Import the TopNavBar component
// import BottomNavBar from "../components/BottomNavBar"; // Import the BottomNavBar component
// import DropDownArrow from "../../public/dropdownarrow.svg"; // Import the dropdownarrow.svg

// export default function Bill() {
//   return (
//     <main className="flex flex-col min-h-screen">
//       <TopNavBar />
//       <div className="flex flex-col items-center justify-center w-full flex-grow px-[14px] py-[24px] gap-[14px]">
//         <h1 className="leading-tight text-[24px]">Bill</h1>
//         <div className="flex w-full justify-between items-center">
//           <div className="flex gap-[10px] items-center">
//             <img
//               className="w-fit h-fit"
//               src={DropDownArrow.src}
//               alt="dropdownarrow"
//             />
//             <p>Total Food</p>
//           </div>
//           <div>
//             <p>€40,95</p>
//           </div>
//         </div>
//         <div className="flex w-full justify-between items-center">
//           <div className="flex gap-[10px] items-center">
//             <img
//               className="w-fit h-fit"
//               src={DropDownArrow.src}
//               alt="dropdownarrow"
//             />
//             <p>Total Drinks</p>
//           </div>
//           <div>
//             <p>€16,65</p>
//           </div>
//         </div>
//         <div className="flex w-full justify-between items-center">
//           <div className="flex gap-[10px] items-center">
//             <img
//               className="w-fit h-fit"
//               src={DropDownArrow.src}
//               alt="dropdownarrow"
//             />
//             <p>Total Desserts</p>
//           </div>
//           <div>
//             <p>€23,35</p>
//           </div>
//         </div>
//         <div className="flex w-full justify-end items-center gap-[6px]">
//           <p>Total:</p>
//           <p>€80,95</p>
//         </div>
//         <div>
//           <button className="flex py-[12px] px-[14px] bg-main rounded-full text-white">
//             Or ask a waiter to pay cash
//           </button>
//         </div>
//       </div>
//       <BottomNavBar />
//     </main>
//   );
// }

"use client";

import React, { useState, useEffect, use } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import DropDownArrow from "../../public/dropdownarrow.svg";
import Image from "next/image";

interface BillItem {
  foodId: string;
  name: string;
  quantity: number;
  modification: string;
  price: number;
  category?: string;
}

type Category = "food" | "drink" | "dessert";

export default function Bill() {
  const [BillItems, setBillItems] = useState<BillItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<Category, boolean>
  >({
    food: false,
    drink: false,
    dessert: false,
  });

  useEffect(() => {
    const items = JSON.parse(
      localStorage.getItem("BillItems") || "[]"
    ) as BillItem[];
    setBillItems(items);
  }, []);

  const toggleCategory = (category: Category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const filterItemsByCategory = (category: Category): BillItem[] => {
    return BillItems.filter((item) => item.category === category);
  };

  const calculateTotal = (items: BillItem[]): string => {
    return items
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const totalFood = calculateTotal(filterItemsByCategory("food"));
  const totalDrinks = calculateTotal(filterItemsByCategory("drink"));
  const totalDesserts = calculateTotal(filterItemsByCategory("dessert"));
  const grandTotal = (
    parseFloat(totalFood) +
    parseFloat(totalDrinks) +
    parseFloat(totalDesserts)
  ).toFixed(2);

  const renderCategorySection = (category: Category, total: string) => (
    <>
      <div className="flex w-full justify-between items-center">
        <div
          className="flex gap-[10px] items-center cursor-pointer"
          onClick={() => toggleCategory(category)}
        >
          <Image
            className={`w-fit h-fit transform ${
              expandedCategories[category] ? "rotate-180" : ""
            }`}
            src={DropDownArrow.src}
            width={20}
            height={20}
            alt="dropdownarrow"
          />
          <p className="font-bold text-2xl">
            Total {category.charAt(0).toUpperCase() + category.slice(1)}
          </p>
        </div>
        <div>
          <p>€{total}</p>
        </div>
      </div>
      {expandedCategories[category] && (
        <div className="w-full pl-4">
          {filterItemsByCategory(category).map((item, index) => (
            <div key={index} className="flex justify-between">
              <p>
                {item.name} x{item.quantity}
              </p>
              <p>€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <main className="flex flex-col min-h-screen">
      <TopNavBar />
      <div className="flex flex-col items-center justify-center w-full flex-grow px-[14px] py-[24px] gap-[14px]">
        <h1 className="leading-tight text-[24px]">Bill</h1>

        {renderCategorySection("food", totalFood)}
        {renderCategorySection("drink", totalDrinks)}
        {renderCategorySection("dessert", totalDesserts)}

        <div className="flex w-full justify-end items-center gap-[6px]">
          <p>Total:</p>
          <p>€{grandTotal}</p>
        </div>
        <div>
          <button className="flex py-[12px] px-[14px] bg-main rounded-full text-white">
            Or ask a waiter to pay cash
          </button>
        </div>
      </div>
      <BottomNavBar />
    </main>
  );
}
