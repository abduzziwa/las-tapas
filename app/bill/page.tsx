import TopNavBar from "../components/TopNavBar"; // Import the TopNavBar component
import BottomNavBar from "../components/BottomNavBar"; // Import the BottomNavBar component

export default function Bill() {
  return (
    <main>
      <TopNavBar />
      <div className="flex flex-col items-center align-middle w-full h-max text-[24px] leading-tight px-[14px] py-[24px] gap-[14px]">
        <h1>Bill</h1>
      </div>
      <BottomNavBar />
    </main>
  );
}
