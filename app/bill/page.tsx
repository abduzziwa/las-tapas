import TopNavBar from "../components/TopNavBar"; // Import the TopNavBar component
import BottomNavBar from "../components/BottomNavBar"; // Import the BottomNavBar component
import DropDownArrow from "../../public/dropdownarrow.svg"; // Import the dropdownarrow.svg

export default function Bill() {
  return (
    <main className="flex flex-col min-h-screen">
      <TopNavBar />
      <div className="flex flex-col items-center justify-center w-full flex-grow px-[14px] py-[24px] gap-[14px]">
        <h1 className="leading-tight text-[24px]">Bill</h1>
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <img
              className="w-fit h-fit"
              src={DropDownArrow.src}
              alt="dropdownarrow"
            />
            <p>Total Food</p>
          </div>
          <div>
            <p>€40,95</p>
          </div>
        </div>
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <img
              className="w-fit h-fit"
              src={DropDownArrow.src}
              alt="dropdownarrow"
            />
            <p>Total Drinks</p>
          </div>
          <div>
            <p>€16,65</p>
          </div>
        </div>
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <img
              className="w-fit h-fit"
              src={DropDownArrow.src}
              alt="dropdownarrow"
            />
            <p>Total Desserts</p>
          </div>
          <div>
            <p>€23,35</p>
          </div>
        </div>
        <div className="flex w-full justify-end items-center gap-[6px]">
          <p>Total:</p>
          <p>€80,95</p>
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
