"use client";
import React, { useEffect, useState } from "react";
import OrdersManager from "./components/OrdersManager";
import styles from "./components/chef.module.css";

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
      <main className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
        <p className="mb-[-1.5rem] text-right">Today is {formattedDate}</p>
        <h1 className="text-left font-bold text-4xl font-sans">
          Welcome Chefs
        </h1>
        <div className="text-center mb-4 mt-[-1rem]">
          <p className="border-4 border-solid border-black inline-block p-2 mb-3">
            Every Second Counts.{" "}
            <span className="text-red-600 font-bold">{formattedTime}</span>
          </p>
        </div>
        <OrdersManager />
      </main>
    </>
  );
};

export default Page;
