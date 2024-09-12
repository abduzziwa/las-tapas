import TopNavBar from "../components/TopNavBar"; // Import the TopNavBar component
import BottomNavBar from "../components/BottomNavBar"; // Import the BottomNavBar component

export default function Bill() {
  return (
    <main>
      <TopNavBar />
      <div className="flex flex-col w-full h-full text-[24px] leading-tight px-[14px] py-[24px] gap-[10px]">
        <h1>Open orders</h1>
      </div>
      <BottomNavBar />
    </main>
  );
}
