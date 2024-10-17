"use client";

import MenuItems from "./components/MenuItems";
import Tables from "./components/Tables";

const AdminDashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-8">
        <MenuItems />
        <Tables />
      </div>
    </div>
  );
};

export default AdminDashboard;
