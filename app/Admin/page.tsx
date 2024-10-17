// "use client";

// import MenuItems from "./components/MenuItems";
// import NavBar from "./components/NavBar";
// import Orders from "./components/Orders";
// import Tables from "./components/Tables";

// const AdminDashboard = () => {
//   return (
//     <div className="p-4">
//       {/* <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1> */}
//       <div className="space-y-8">
//         <NavBar />
//         <MenuItems />
//         <Tables />
//         <Orders />
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

"use client";

import { useState } from "react";
import MenuItems from "./components/MenuItems";
import NavBar from "./components/NavBar";
import Orders from "./components/Orders";
import Tables from "./components/Tables";

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
      default:
        return <Orders />;
    }
  };

  return (
    <div className="p-4">
      <NavBar setSelectedComponent={setSelectedComponent} />
      <div className="space-y-8">{renderComponent()}</div>
    </div>
  );
};

export default AdminDashboard;
