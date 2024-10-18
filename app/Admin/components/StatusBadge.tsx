// import React from "react";
// import { Badge } from "@/components/ui/badge";

// export interface StatusBadgeProps {
//   status:
//     | "notYetOrdered"
//     | "ordered"
//     | "preparing"
//     | "ready"
//     | "served"
//     | "occupied"
//     | "booked"
//     | "available";
//   children: React.ReactNode;
// }

// const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
//   const statusStyles = {
//     // Order status styles
//     served: "bg-green-500 hover:bg-green-600",
//     ready: "bg-teal-500 hover:bg-teal-600",
//     preparing: "bg-yellow-500 hover:bg-yellow-600",
//     ordered: "bg-indigo-500 hover:bg-indigo-600",
//     notYetOrdered: "",
//     // Table status styles
//     occupied: "bg-red-500 hover:bg-red-600",
//     booked: "bg-orange-500 hover:bg-orange-600",
//     available: "bg-green-500 hover:bg-green-600",
//   };

//   // Return null for "notYetOrdered" status (when no badge should be shown)
//   if (status === "notYetOrdered") {
//     return null;
//   }

//   return (
//     <Badge className={`${statusStyles[status]} text-white`}>{children}</Badge>
//   );
// };

// export default StatusBadge;

import React from "react";
import { Badge } from "@/components/ui/badge";

// Define individual types for better type safety and readability
type OrderStatus =
  | "notYetOrdered"
  | "ordered"
  | "preparing"
  | "ready"
  | "served";
type TableStatus = "occupied" | "booked" | "available";
type PaymentStatus = "paid" | "unpaid" | "wantToPay";

// Combine all the possible statuses into a single type
type Status = OrderStatus | TableStatus | PaymentStatus;

export interface StatusBadgeProps {
  status: Status;
  children: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  // Extend the statusStyles object to include styles for payment statuses
  const statusStyles = {
    // Order status styles
    served: "bg-green-500 hover:bg-green-600",
    ready: "bg-teal-500 hover:bg-teal-600",
    preparing: "bg-yellow-500 hover:bg-yellow-600",
    ordered: "bg-indigo-500 hover:bg-indigo-600",
    notYetOrdered: "",
    // Table status styles
    occupied: "bg-red-500 hover:bg-red-600",
    booked: "bg-orange-500 hover:bg-orange-600",
    available: "bg-green-500 hover:bg-green-600",
    // Payment status styles
    paid: "bg-blue-500 hover:bg-blue-600",
    unpaid: "bg-gray-500 hover:bg-gray-600",
    wantToPay: "bg-yellow-500 hover:bg-yellow-600",
  };

  // Return null for "notYetOrdered" status (when no badge should be shown)
  if (status === "notYetOrdered") {
    return null;
  }

  return (
    <Badge className={`${statusStyles[status]} text-white`}>{children}</Badge>
  );
};

export default StatusBadge;
