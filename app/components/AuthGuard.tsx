"use client";
import { useEffect, useState } from "react";

import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check sessionStorage for sessionId and tableNumber
    const sessionId = sessionStorage.getItem("sessionId");
    const tableNumber = sessionStorage.getItem("tableNumber");
    // sessionStorage.setItem("sessionId", sessionId);
    // sessionStorage.setItem("tableNumber", tableNumber);

    if (sessionId && tableNumber) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <p className="text-4xl text-center text-red-600">Unauthorized Access</p>
        <p className="mt-11 font-bold text-2xl">Please scan the QRCODE</p>
        <p className="mt-2 font-bold text-2xl">On your table</p>
      </div>
    );
  }

  // Render the children if authorized
  return <>{children}</>;
}
