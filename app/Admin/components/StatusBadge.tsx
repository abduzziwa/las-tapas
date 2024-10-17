import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "notYetOrdered" | "ordered" | "preparing" | "ready" | "served";
  children: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const statusStyles = {
    served: "bg-green-500 hover:bg-green-600",
    ready: "bg-teal-500 hover:bg-teal-600",
    preparing: "bg-yellow-500 hover:bg-yellow-600",
    ordered: "bg-indigo-500 hover:bg-indigo-600",
    notYetOrdered: "",
  };

  if (status === "notYetOrdered") {
    return null;
  }
  return (
    <Badge className={`${statusStyles[status]} text-white`}>{children}</Badge>
  );
};

export default StatusBadge;
