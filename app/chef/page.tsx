"use client";
import React, { useEffect, useState } from "react";
import OrdersManager from "./components/OrdersManager";
import styles from "./components/chef.module.css";

const Page = () => {
  // const [refreshKey, setRefreshKey] = useState(0); // Key to force re-mount

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setRefreshKey((prevKey) => prevKey + 1); // Trigger a re-render by updating the key
  //   }, 10000); // Refresh every 2 seconds

  //   return () => clearInterval(timer);
  // }, []);

  return (
    <>
      <main className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
        <OrdersManager />
      </main>
    </>
  );
};

export default Page;
