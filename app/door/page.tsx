"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type State = "loading" | "success" | "already-done" | "error";

interface CheckoutResult {
  message: string;
  sessionId?: string;
  tableNumber?: string;
  tableFreed?: boolean;
  alreadyDone?: boolean;
}

function DoorContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [result, setResult] = useState<CheckoutResult | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      return;
    }

    fetch(`/api/checkout?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        setResult(data);
        if (!res.ok) {
          setState("error");
        } else if (data.alreadyDone) {
          setState("already-done");
        } else {
          setState("success");
        }
      })
      .catch(() => setState("error"));
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Processing checkout…</p>
        </div>
      )}

      {state === "success" && (
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Checkout confirmed</h1>
          {result?.tableNumber && (
            <p className="text-gray-500 text-sm mb-1">
              {result.tableNumber} — guest has departed
            </p>
          )}
          {result?.tableFreed && (
            <p className="text-sm text-green-600 font-medium mt-2">Table is now free</p>
          )}
          {!result?.tableFreed && (
            <p className="text-sm text-amber-600 mt-2">Other guests still at this table</p>
          )}
        </div>
      )}

      {state === "already-done" && (
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">ℹ️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Already checked out</h1>
          <p className="text-gray-500 text-sm">This guest has already been checked out.</p>
        </div>
      )}

      {state === "error" && (
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Checkout failed</h1>
          <p className="text-gray-500 text-sm">
            {result?.message || "Invalid or expired QR code. Please try again."}
          </p>
        </div>
      )}
    </main>
  );
}

export default function DoorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <DoorContent />
    </Suspense>
  );
}
