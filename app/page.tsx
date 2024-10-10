// import TopNavBar from "./components/TopNavBar"; // Import the TopNavBar component
// import BottomNavBar from "./components/BottomNavBar"; // Import the BottomNavBar component

// import Carousel from "./components/Carousel"; // Import the Carousel component
// import foodImage from "../public/food.png"; // Import the images
// import dessertsImage from "../public/desserts.png"; // Import the images
// import drinksImage from "../public/drinks.png"; // Import the images
// import Link from "next/link";

// const images = [foodImage.src, dessertsImage.src, drinksImage.src];

// export default function Home() {
//   document.addEventListener("DOMContentLoaded", function () {
//     const sessionStorageDataCookie = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("sessionStorageData="));
//     if (sessionStorageDataCookie) {
//       const sessionStorageData = JSON.parse(
//         decodeURIComponent(sessionStorageDataCookie.split("=")[1])
//       );

//       // Store data in sessionStorage
//       sessionStorage.setItem("sessionId", sessionStorageData.sessionId);
//       sessionStorage.setItem("tableNumber", sessionStorageData.tableNumber);

//       // Remove the cookie after reading it
//       document.cookie =
//         "sessionStorageData=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     }
//   });
//   return (
//     <main>
//       <TopNavBar />
//       <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">
//         <Link
//           href="/menu/foods"
//           className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/food.png')] bg-cover bg-center"
//         >
//           <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
//             Food
//           </p>
//         </Link>

//         <div className="flex flex-row w-full gap-[10px]">
//           <Link
//             href="/menu/drinks"
//             className="flex items-end w-full w-50% h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/drinks.png')] bg-cover bg-center"
//           >
//             <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
//               Drinks
//             </p>
//           </Link>

//           <Link
//             href="/menu/desserts"
//             className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/desserts.png')] bg-cover bg-center"
//           >
//             <p className=" text-white text-[28px] font-bold drop-shadow-lg leading-tight">
//               Desserts
//             </p>
//           </Link>
//         </div>
//       </div>

//       <div className="flex flex-col w-full items-center px-[24px] gap-[8px]">
//         <p className="text-textcolor text-[24px] leading-tight font-light text-center">
//           Deals off the week
//         </p>

//         <div className="flex w-full">
//           <Carousel images={images} />
//         </div>
//       </div>

//       <BottomNavBar />
//     </main>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import TopNavBar from "./components/TopNavBar";
import BottomNavBar from "./components/BottomNavBar";
import Carousel from "./components/Carousel";
import foodImage from "../public/food.png";
import dessertsImage from "../public/desserts.png";
import drinksImage from "../public/drinks.png";
import Link from "next/link";

const images = [foodImage.src, dessertsImage.src, drinksImage.src];

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const sessionId = searchParams.get("sessionId");
    const tableNumber = searchParams.get("tableNumber");

    //for the cart
    // const sessionId = sessionStorage.getItem("sessionId");
    // const tableNumber = sessionStorage.getItem("tableNumber");

    if (sessionId && tableNumber) {
      sessionStorage.setItem("sessionId", sessionId);
      sessionStorage.setItem("tableNumber", tableNumber);
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <p className="text-4xl text-center text-red-600">Unauthorized Acess</p>
        <p className="mt-11 font-bold text-2xl">Please scan the QRCODE</p>
        <p className="mt-2 font-bold text-2xl">On your table</p>
      </div>
    );
  }
  return (
    <main>
      <TopNavBar />
      <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">
        <Link
          href="/menu/foods"
          className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/food.png')] bg-cover bg-center"
        >
          <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
            Food
          </p>
        </Link>

        <div className="flex flex-row w-full gap-[10px]">
          <Link
            href="/menu/drinks"
            className="flex items-end w-full w-50% h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/drinks.png')] bg-cover bg-center"
          >
            <p className="text-white text-[28px] font-bold drop-shadow-lg leading-tight">
              Drinks
            </p>
          </Link>

          <Link
            href="/menu/desserts"
            className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/desserts.png')] bg-cover bg-center"
          >
            <p className=" text-white text-[28px] font-bold drop-shadow-lg leading-tight">
              Desserts
            </p>
          </Link>
        </div>
      </div>

      <div className="flex flex-col w-full items-center px-[24px] gap-[8px]">
        <p className="text-textcolor text-[24px] leading-tight font-light text-center">
          Deals off the week
        </p>

        <div className="flex w-full">
          <Carousel images={images} />
        </div>
      </div>

      <BottomNavBar />
    </main>
  );
}
