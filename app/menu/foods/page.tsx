import TopNavBar from "../../components/TopNavBar"; // Import the TopNavBar component
import BottomNavBar from "../../components/BottomNavBar"; // Import the BottomNavBar component
import Link from "next/link";

export default function Foods() {
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

      <BottomNavBar />
    </main>
  );
}
