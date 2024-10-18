// "use client"; // Add this line to mark the component as a Client Component

// import Link from "next/link"; // Import the Link component
// import { usePathname } from "next/navigation"; // Import usePathname to access current route

// import homeIcon from "../../public/home-icon.svg"; // Import the home icon image
// import historyIcon from "../../public/history-icon.svg"; // Import the history icon image
// import cartIcon from "../../public/cart-icon.svg"; // Import the cart icon image
// import billIcon from "../../public/bill-icon.svg"; // Import the bill icon image

// import homeIconActive from "../../public/home-icon-active.svg"; // Import the home icon active image
// import historyIconActive from "../../public/history-icon-active.svg"; // Import the history icon active image
// import cartIconActive from "../../public/cart-icon-active.svg"; // Import the cart icon active image
// import billIconActive from "../../public/bill-icon-active.svg"; // Import the bill icon active image

// export default function BottomNavBar() {
//   const currentPath = usePathname(); // Get the current path

//   return (
//     <div className="flex w-full h-fit px-[10px] py-[8px] fixed bottom-0 left-0 right-0 ">
//       <div className="flex flex-row flex-1 justify-between px-[26px] py-[12px] bg-gradient-to-tr from-main to-gradientEnd drop-shadow-lg rounded-full">
//         <Link href="/">
//           {currentPath === "/" ? (
//             <img src={homeIconActive.src} alt="Home Icon" />
//           ) : (
//             <img src={homeIcon.src} alt="Home Icon" />
//           )}
//         </Link>
//         <Link href="/orderHistory">
//           {currentPath === "/orderHistory" ? (
//             <img src={historyIconActive.src} alt="History Icon" />
//           ) : (
//             <img src={historyIcon.src} alt="History Icon" />
//           )}
//         </Link>
//         <Link href="/cart">
//           {currentPath === "/cart" ? (
//             <img src={cartIconActive.src} alt="Cart Icon" />
//           ) : (
//             <img src={cartIcon.src} alt="Cart Icon" />
//           )}
//         </Link>
//         <Link href="/bill">
//           {currentPath === "/bill" ? (
//             <img src={billIconActive.src} alt="Bill Icon" />
//           ) : (
//             <img src={billIcon.src} alt="Bill Icon" />
//           )}
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client"; // Add this line to mark the component as a Client Component

import Link from "next/link"; // Import the Link component
import { usePathname } from "next/navigation"; // Import usePathname to access current route
import { useEffect, useState } from "react"; // Import useEffect and useState

import homeIcon from "../../public/home-icon.svg"; // Import the home icon image
import historyIcon from "../../public/history-icon.svg"; // Import the history icon image
import cartIcon from "../../public/cart-icon.svg"; // Import the cart icon image
import billIcon from "../../public/bill-icon.svg"; // Import the bill icon image

import homeIconActive from "../../public/home-icon-active.svg"; // Import the home icon active image
import historyIconActive from "../../public/history-icon-active.svg"; // Import the history icon active image
import cartIconActive from "../../public/cart-icon-active.svg"; // Import the cart icon active image
import billIconActive from "../../public/bill-icon-active.svg"; // Import the bill icon active image

export default function BottomNavBar() {
  const currentPath = usePathname(); // Get the current path
  const [cartItemCount, setCartItemCount] = useState<number>(0); // State to hold the cart item count

  // Function to fetch the cart item count from local storage
  const getCartItemCount = () => {
    const storedCartItems = localStorage.getItem("CartItems");
    if (storedCartItems) {
      const cartItems = JSON.parse(storedCartItems);
      return cartItems.reduce(
        (total: number, item: { quantity: number }) => total + item.quantity,
        0
      );
    }
    return 0;
  };

  // Update cart item count on component mount and whenever cart items change
  useEffect(() => {
    const updateCartItemCount = () => {
      setCartItemCount(getCartItemCount());
    };

    // Update count initially
    updateCartItemCount();

    // Set up a listener to update cart count whenever localStorage changes
    const handleStorageChange = () => {
      updateCartItemCount();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="flex w-full h-fit px-[10px] py-[8px] fixed bottom-0 left-0 right-0 ">
      <div className="flex flex-row flex-1 justify-between px-[26px] py-[12px] bg-custom-gradient drop-shadow-lg rounded-full">
        <Link href="/">
          {currentPath === "/" ? (
            <img src={homeIconActive.src} alt="Home Icon" />
          ) : (
            <img src={homeIcon.src} alt="Home Icon" />
          )}
        </Link>
        <Link href="/orderHistory">
          {currentPath === "/orderHistory" ? (
            <img src={historyIconActive.src} alt="History Icon" />
          ) : (
            <img src={historyIcon.src} alt="History Icon" />
          )}
        </Link>
        <Link href="/cart" className="relative">
          {" "}
          {/* Add relative positioning for the cart icon */}
          {currentPath === "/cart" ? (
            <img src={cartIconActive.src} alt="Cart Icon" />
          ) : (
            <img src={cartIcon.src} alt="Cart Icon" />
          )}
          {cartItemCount > 0 && ( // Conditionally render the item count if it's greater than 0
            <span className="absolute top-[-10px] right-[-12px] bg-white hover:bg-black hover:text-white text-red-600 text-sm rounded-full h-7 w-7 flex items-center justify-center font-bold">
              {cartItemCount}
            </span>
          )}
        </Link>
        <Link href="/bill">
          {currentPath === "/bill" ? (
            <img src={billIconActive.src} alt="Bill Icon" />
          ) : (
            <img src={billIcon.src} alt="Bill Icon" />
          )}
        </Link>
      </div>
    </div>
  );
}
