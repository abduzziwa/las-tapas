"use client";
import React, { useState, useEffect } from "react";
import styles from "../chef/components/chef.module.css";
import Header from "./components/Header";
import WaiterOrderManager from "./components/WaiterOrderManager";

const Page: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0); // Key to force re-mount

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey((prevKey) => prevKey + 1); // Trigger a re-render by updating the key
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Header />
      {/* Key forces the component to remount */}
      <main key={refreshKey} className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
        <WaiterOrderManager />
      </main>
    </>
  );
};

export default Page;
