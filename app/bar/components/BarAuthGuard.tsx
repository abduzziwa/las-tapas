"use client";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

interface BarAuthGuardProps {
  children: ReactNode;
}

export default function BarAuthGuard({ children }: BarAuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const employeeId = sessionStorage.getItem("employeeId");
    setIsAuthorized(!!employeeId);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <p className="text-4xl text-center text-red-600 font-bold">Unauthorized Access</p>
        <p className="text-2xl font-bold">Please log in as a bar employee</p>
      </div>
    );
  }

  return <>{children}</>;
}
