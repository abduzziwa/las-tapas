"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import PrivacyModal from "./PrivacyModal";
import NameModal from "./NameModal";

interface AuthGuardProps {
  children: ReactNode;
}

type Status = "loading" | "unauthorized" | "needs-privacy" | "needs-name" | "authorized";

export default function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<Status>("loading");
  const router = useRouter();
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Kick off session health polling once the session is authorized
  const startHealthCheck = (sessionId: string) => {
    if (healthIntervalRef.current) return; // already running
    healthIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/check?sessionId=${sessionId}`);
        const data = await res.json();
        if (!data.active) {
          clearInterval(healthIntervalRef.current!);
          router.replace("/goodbye");
        }
      } catch {
        // Network error — don't kick the customer out
      }
    }, 10000);
  };

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    const tableNumber = sessionStorage.getItem("tableNumber");

    if (!sessionId || !tableNumber) {
      setStatus("unauthorized");
      return;
    }

    if (localStorage.getItem("privacyAccepted") !== "true") {
      setStatus("needs-privacy");
      return;
    }

    if (sessionStorage.getItem("nameAsked") !== "true") {
      setStatus("needs-name");
      return;
    }

    setStatus("authorized");
    startHealthCheck(sessionId);

    return () => {
      if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") return null;

  if (status === "unauthorized") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: 'linear-gradient(160deg,#1a0800,#3d1500)' }}>
        <div className="text-6xl mb-6">🍷</div>
        <h1 className="text-white text-2xl font-bold mb-2">Welcome to Las Tapas</h1>
        <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-xs">
          To browse our menu and place an order, please scan the QR code at your table.
        </p>
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: '#F95E07', color: '#fff' }}>
          Scan QR at your table
        </div>
      </div>
    );
  }

  if (status === "needs-privacy") {
    return (
      <>
        <div className="filter blur-sm pointer-events-none select-none">{children}</div>
        <PrivacyModal
          onAccept={() => {
            if (sessionStorage.getItem("nameAsked") !== "true") {
              setStatus("needs-name");
            } else {
              setStatus("authorized");
              const sid = sessionStorage.getItem("sessionId");
              if (sid) startHealthCheck(sid);
            }
          }}
        />
      </>
    );
  }

  if (status === "needs-name") {
    return (
      <>
        <div className="filter blur-sm pointer-events-none select-none">{children}</div>
        <NameModal onDone={() => {
          setStatus("authorized");
          const sid = sessionStorage.getItem("sessionId");
          if (sid) startHealthCheck(sid);
        }} />
      </>
    );
  }

  return <>{children}</>;
}
