"use client";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function WaiterAuthGuard({ children }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if employeeId is in sessionStorage
    let sessionId = sessionStorage.getItem("employeeId");

    // If not found in sessionStorage, check the URL for employeeId
    if (!sessionId) {
      const urlParams = new URLSearchParams(window.location.search);
      const employeeIdFromUrl = urlParams.get("employeeId");
      console.log("Employee ID from URL:", employeeIdFromUrl);
    }

    // Set the authorization state based on whether sessionId exists
    if (sessionId) {
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
        <p className="mt-2 font-bold text-2xl">FOR EMPLOYEES</p>
      </div>
    );
  }

  // Render the children if authorized
  return <>{children}</>;
}
