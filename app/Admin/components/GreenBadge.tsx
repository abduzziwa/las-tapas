import React from "react";
import { Badge } from "@/components/ui/badge";

import { ReactNode } from "react";

const GreenBadge = ({ children }: { children: ReactNode }) => {
  return (
    <Badge className="bg-green-500 hover:bg-green-600 text-white">
      {children}
    </Badge>
  );
};

export default GreenBadge;
