import TopNavbar from "./components/topnavbar";
import BottomNavbar from "./components/bottomnavbar";

export default function Home() {
return (
<main>
    <TopNavbar />
    <div className="flex flex-col w-full items-center p-[24px] gap-[10px]">

        <div
            className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/food.png')] bg-cover">
            <p className="text-base text-white text-[32px] font-bold drop-shadow-lg leading-tight">Food</p>
        </div>

        <div className="flex flex-row w-full gap-[10px]">

            <div
                className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/drinks.png')] bg-cover">
                <p className="text-base text-white text-[32px] font-bold drop-shadow-lg leading-tight">Drinks</p>
            </div>

            <div
                className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/desserts.png')] bg-cover">
                <p className=" text-white text-[32px] font-bold drop-shadow-lg leading-tight">Desserts</p>
            </div>
        </div>

    </div>

    <div className="flex flex-col w-full items-center px-[24px] gap-[8px]">
        <p className="text-textcolor text-[32px] leading-tight font-medium text-center">Popular Items</p>

        <div
            className="flex items-end w-full h-[155px] rounded-[20px] py-[10px] px-[16px] drop-shadow-lg bg-[url('../public/nachos.png')] bg-center bg-cover">
            <p className="text-grey text-white text-[32px] font-bold drop-shadow-lg leading-tight">Nachos</p>
        </div>

    </div>

    <BottomNavbar />
</main>
);
}
