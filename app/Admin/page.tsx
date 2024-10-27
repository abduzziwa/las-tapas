"use client";

import { useState } from "react";
import MenuItems from "./components/MenuItems";
import NavBar from "./components/NavBar";
import Orders from "./components/Orders";
import Tables from "./components/Tables";
import Employees from "./components/employees";
import WaiterAuthGuard from "../waiter/components/WaiterAuthGuard";

const AdminDashboard = () => {
  const [selectedComponent, setSelectedComponent] = useState("Orders");

  // Function to render the selected component
  const renderComponent = () => {
    switch (selectedComponent) {
      case "Orders":
        return <Orders />;
      case "Tables":
        return <Tables />;
      case "MenuItems":
        return <MenuItems />;
      case "Employees":
        return <Employees />;
      default:
        return <Orders />;
    }
  };

  return (
    <WaiterAuthGuard>
      <div className="p-4">
        <NavBar setSelectedComponent={setSelectedComponent} />
        <div className="space-y-8">{renderComponent()}</div>
      </div>
    </WaiterAuthGuard>
  );
};

export default AdminDashboard;
