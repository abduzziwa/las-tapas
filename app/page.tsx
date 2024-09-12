import TopNavBar from "./components/TopNavBar"; // Import the TopNavBar component
import BottomNavBar from "./components/BottomNavBar"; // Import the BottomNavBar component

import Carousel from "./components/Carousel"; // Import the Carousel component
import foodImage from "../public/food.png"; // Import the images
import dessertsImage from "../public/desserts.png"; // Import the images
import drinksImage from "../public/drinks.png"; // Import the images
import Link from "next/link";

const images = [foodImage.src, dessertsImage.src, drinksImage.src];

export default function Home() {
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
        <p className="text-textcolor text-[28px] leading-tight font-medium text-center">
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
