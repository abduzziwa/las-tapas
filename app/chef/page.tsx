"use client";
import React, { useEffect, useState } from "react";
import OrdersManager from "./components/OrdersManager";
import styles from "./components/chef.module.css";
import WaiterAuthGuard from "../waiter/components/WaiterAuthGuard";

const Page = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  // Format the current date and time
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  return (
    <>
      <WaiterAuthGuard>
        <h1 className="text-2xl font-bold text-center">HALLO CHEFS</h1>
        <main className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
          <OrdersManager />
        </main>
      </WaiterAuthGuard>
    </>
  );
};

export default Page;
