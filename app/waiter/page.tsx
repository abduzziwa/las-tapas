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

// "use client";
// import React, { useState } from "react";
// import styles from "../chef/components/chef.module.css";
// import Header from "./components/Header";
// import WaiterOrderManager from "./components/WaiterOrderManager";
// import WaiterOrderManagerHistory from "./components/waiterOrderManagerHistory";
// import WaiterOrderManagerPayRequests from "./components/waiterOrderManagerPayRequests";

// const Page = () => {
//   const [activeComponent, setActiveComponent] = useState("waiter");

//   const renderContent = () => {
//     switch (activeComponent) {
//       case "waiter":
//         return <WaiterOrderManager />;
//       case "history":
//         return <WaiterOrderManagerHistory />; // Add your History component here
//       case "payRequests":
//         return <WaiterOrderManagerPayRequests />; // Add your PayRequests component here
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Header
//         activeComponent={activeComponent}
//         setActiveComponent={setActiveComponent}
//       />
//       <main className={`${styles.mainChef} mt-4 m-[3.5rem]`}>
//         {renderContent()}
//       </main>
//     </>
//   );
// };

// export default Page;

"use client";
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../chef/components/chef.module.css";
import Header from "./components/Header";
import WaiterOrderManager from "./components/WaiterOrderManager";
import WaiterOrderManagerHistory from "./components/waiterOrderManagerHistory";
import WaiterOrderManagerPayRequests from "./components/waiterOrderManagerPayRequests";
import { endpoints } from "@/app/api/endpoint";
import WaiterAuthGuard from "./components/WaiterAuthGuard";

// Create Toast Context
const ToastContext = createContext<any>(undefined);

// Toast Provider Component
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const previousPaymentOrdersRef = useRef<Set<string>>(new Set());

  const fetchPaymentRequests = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${endpoints.next_ip_port}/api/orders/waiterOrderlistWantToPay`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const currentPaymentOrders = data.filter(
          (order) => order.payment === "wantToPay"
        );

        const currentPaymentOrderIds = new Set(
          currentPaymentOrders.map((order) => order.orderId)
        );

        // Check for new payment requests and show toast
        currentPaymentOrders.forEach((order) => {
          if (!previousPaymentOrdersRef.current.has(order.orderId)) {
            toast.info(`Table ${order.tableNumber} has requested to pay! 💰`, {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: true,
            });
          }
        });

        previousPaymentOrdersRef.current = currentPaymentOrderIds;
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    }
  }, []);

  // Set up polling interval
  useEffect(() => {
    fetchPaymentRequests();
    const intervalId = setInterval(fetchPaymentRequests, 2000);
    return () => clearInterval(intervalId);
  }, [fetchPaymentRequests]);

  return (
    <ToastContext.Provider value={{ fetchPaymentRequests }}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {children}
    </ToastContext.Provider>
  );
};

// Main Page Component
const Page = () => {
  const [activeComponent, setActiveComponent] = useState("waiter");

  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const sessionId = searchParams.get("employeeId");

    if (sessionId) {
      sessionStorage.setItem("employeeId", sessionId);
    }
  }, []);

  const renderContent = () => {
    switch (activeComponent) {
      case "waiter":
        return <WaiterOrderManager />;
      case "history":
        return <WaiterOrderManagerHistory />;
      case "payRequests":
        return <WaiterOrderManagerPayRequests />;
      default:
        return null;
    }
  };

  return (
    <WaiterAuthGuard>
      <ToastProvider>
        <div className={styles.container}>
          <Header
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
          {renderContent()}
        </div>
      </ToastProvider>
    </WaiterAuthGuard>
  );
};

export default Page;
