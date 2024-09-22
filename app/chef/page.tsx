import React from "react";
import OrdersManager from "./components/OrdersManager";
import styles from "./components/chef.module.css";

const Page = () => {
  return (
    <>
      <main className={`${styles.mainChef} w-full p-4`}>
        <OrdersManager />
      </main>
    </>
  );
};

export default Page;
