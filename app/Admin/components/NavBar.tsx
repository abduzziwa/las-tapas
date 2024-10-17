// import React, { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Search, Menu } from "lucide-react";
// import Link from "next/link";

// const NavBar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <nav className="bg-white shadow-md">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <span className="text-xl font-bold text-gray-800">
//                 Las Tapas Manager
//               </span>
//             </div>
//             <div className="hidden md:block">
//               <div className="ml-10 flex items-baseline space-x-4">
//                 <Button
//                   variant="ghost"
//                   className="text-gray-600 hover:text-gray-900"
//                 >
//                   Orders
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   className="text-gray-600 hover:text-gray-900"
//                 >
//                   Tables
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   className="text-gray-600 hover:text-gray-900"
//                 >
//                   Menu Items
//                 </Button>
//               </div>
//             </div>
//           </div>
//           <div className="hidden md:block">
//             <div className="ml-4 flex items-center md:ml-6">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <Input
//                   type="text"
//                   placeholder="Search..."
//                   className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="-mr-2 flex md:hidden">
//             <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
//               <Menu className="h-6 w-6" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {isMenuOpen && (
//         <div className="md:hidden">
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             <Button
//               variant="ghost"
//               className="block text-gray-600 hover:text-gray-900 w-full text-left"
//             >
//               Orders
//             </Button>
//             <Button
//               variant="ghost"
//               className="block text-gray-600 hover:text-gray-900 w-full text-left"
//             >
//               Tables
//             </Button>
//             <Button
//               variant="ghost"
//               className="block text-gray-600 hover:text-gray-900 w-full text-left"
//             >
//               Menu Items
//             </Button>
//           </div>
//           <div className="pt-4 pb-3 border-t border-gray-200">
//             <div className="px-2">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <Input
//                   type="text"
//                   placeholder="Search..."
//                   className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default NavBar;

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";

const NavBar = ({ setSelectedComponent }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-800">
                Las Tapas Manager
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setSelectedComponent("Orders")}
                >
                  Orders
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setSelectedComponent("Tables")}
                >
                  Tables
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setSelectedComponent("MenuItems")}
                >
                  Menu Items
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Button
              variant="ghost"
              className="block text-gray-600 hover:text-gray-900 w-full text-left"
              onClick={() => setSelectedComponent("Orders")}
            >
              Orders
            </Button>
            <Button
              variant="ghost"
              className="block text-gray-600 hover:text-gray-900 w-full text-left"
              onClick={() => setSelectedComponent("Tables")}
            >
              Tables
            </Button>
            <Button
              variant="ghost"
              className="block text-gray-600 hover:text-gray-900 w-full text-left"
              onClick={() => setSelectedComponent("MenuItems")}
            >
              Menu Items
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
