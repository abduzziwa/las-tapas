// "use client";
// import React, { useState, useEffect } from "react";
// import styles from "../chef/components/chef.module.css";
// import Header from "./components/Header";
// import WaiterOrderManager from "./components/WaiterOrderManager";

// const Page: React.FC = () => {
//   // const [refreshKey, setRefreshKey] = useState(0); // Key to force re-mount

//   // useEffect(() => {
//   //   const timer = setInterval(() => {
//   //     setRefreshKey((prevKey) => prevKey + 1); // Trigger a re-render by updating the key
//   //   }, 10000); // Refresh every 2 seconds

//   //   return () => clearInterval(timer);
//   // }, []);

//   return (
//     <>
//       <Header />
//       {/* Key forces the component to remount */}
//       <main className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
//         <WaiterOrderManager />
//       </main>
//     </>
//   );
// };

// export default Page;
// "use client";
// import React from "react";
// import { usePathname } from "next/navigation";
// import styles from "../chef/components/chef.module.css";
// import Header from "./components/Header";
// import WaiterOrderManager from "./components/WaiterOrderManager";
// import WaiterOrderManagerHistory from "./components/waiterOrderManagerHistory";

// const Page = () => {
//   const pathname = usePathname();

//   const renderContent = () => {
//     switch (pathname) {
//       case "waiter":
//         return <WaiterOrderManager />;
//       case "history":
//         return <WaiterOrderManagerHistory />; // Add your History component here
//       case "pay-requests":
//         return null; // Add your PayRequests component here
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Header />
//       <main className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
//         {renderContent()}
//       </main>
//     </>
//   );
// };

// export default Page;

"use client";
import React, { useState } from "react";
import styles from "../chef/components/chef.module.css";
import Header from "./components/Header";
import WaiterOrderManager from "./components/WaiterOrderManager";
import WaiterOrderManagerHistory from "./components/waiterOrderManagerHistory";
import WaiterOrderManagerPayRequests from "./components/waiterOrderManagerPayRequests";

const Page = () => {
  const [activeComponent, setActiveComponent] = useState("waiter");

  const renderContent = () => {
    switch (activeComponent) {
      case "waiter":
        return <WaiterOrderManager />;
      case "history":
        return <WaiterOrderManagerHistory />; // Add your History component here
      case "payRequests":
        return <WaiterOrderManagerPayRequests />; // Add your PayRequests component here
      default:
        return null;
    }
  };

  return (
    <>
      <Header
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <main className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
        {renderContent()}
      </main>
    </>
  );
};

export default Page;
