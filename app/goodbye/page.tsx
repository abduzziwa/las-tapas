"use client";
import { useEffect } from "react";

export default function GoodbyePage() {
  useEffect(() => {
    // Clear all session data so a future scan starts fresh
    sessionStorage.clear();
    localStorage.removeItem("privacyAccepted");
    // Keep other localStorage keys (e.g. app preferences) intact
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F95E07] to-[#DB8555] px-6 text-white text-center">
      <div className="max-w-sm">
        <div className="text-7xl mb-6">👋</div>
        <h1 className="text-3xl font-bold mb-3">Thank you!</h1>
        <p className="text-orange-100 text-lg leading-relaxed mb-2">
          We hope you enjoyed your visit at <strong>Las Tapas</strong>.
        </p>
        <p className="text-orange-100 text-sm">
          We&apos;d love to see you again soon.
        </p>
      </div>

      <footer className="absolute bottom-6 text-orange-200 text-xs">
        Your session has ended. All personal data has been cleared.
      </footer>
    </main>
  );
}
