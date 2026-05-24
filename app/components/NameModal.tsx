"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NameModalProps {
  onDone: (name: string) => void;
}

export default function NameModal({ onDone }: NameModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Small delay so the modal animation finishes before focusing
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const submit = async (chosenName: string) => {
    setSaving(true);
    const trimmed = chosenName.trim();
    const sessionId = sessionStorage.getItem("sessionId");

    if (trimmed && sessionId) {
      try {
        await fetch("/api/sessions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, guestName: trimmed }),
        });
      } catch {
        // Non-critical — continue even if save fails
      }
    }

    sessionStorage.setItem("guestName", trimmed);
    sessionStorage.setItem("nameAsked", "true");
    setSaving(false);
    onDone(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(name);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-6 sm:pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
        >
          {/* Icon + heading */}
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">👋</div>
            <h2 className="text-xl font-bold text-gray-900">Welcome to Las Tapas!</h2>
            <p className="text-gray-500 text-sm mt-1">
              What should we call you? Your waiter will use this to address you personally.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Sarah, The Birthday Table…"
              maxLength={50}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-orange-400 transition-colors"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-white text-base transition-opacity"
              style={{ background: "linear-gradient(135deg, #F95E07, #DB8555)" }}
            >
              {saving ? "Saving…" : name.trim() ? `Hi ${name.trim()}! Let's go 🍽️` : "Sure, let's go!"}
            </button>

            <button
              type="button"
              onClick={() => submit("")}
              disabled={saving}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip — I'd rather stay anonymous
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
