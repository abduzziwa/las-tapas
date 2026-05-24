"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PrivacyModalProps {
  onAccept: () => void;
}

export default function PrivacyModal({ onAccept }: PrivacyModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    if (atBottom) setHasScrolled(true);
  };

  const handleAccept = () => {
    localStorage.setItem("privacyAccepted", "true");
    onAccept();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold"
                style={{ background: "linear-gradient(135deg, #F95E07, #DB8555)" }}>
                🔒
              </div>
              <h2 className="text-xl font-bold text-gray-900">Privacy Notice</h2>
            </div>
            <p className="text-sm text-gray-500">Las Tapas Restaurant — Required by AVG/GDPR</p>
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4 text-sm text-gray-700 space-y-4"
            onScroll={handleScroll}
          >
            <section>
              <h3 className="font-semibold text-gray-900 mb-1">What we collect</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>An anonymous session ID linked to your table and seat</li>
                <li>Your order items, quantities, and special requests</li>
                <li>Order timestamps (when ordered, prepared, served)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Why we collect it</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>To process and route your order to the kitchen and bar</li>
                <li>To generate your table bill</li>
                <li>For legal accounting and compliance obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">How long we keep it</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Your session data is removed after your visit ends</li>
                <li>Order records are kept for <strong>30 days</strong> for accounting</li>
                <li>
                  <strong>No personal data</strong> (name, email, phone) is collected
                  unless you voluntarily create an account
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Payment</h3>
              <p className="text-gray-600">
                We do not process or store your card details on this device. All payments
                are handled by your waiter. This system only records whether your bill
                has been paid — not how.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Your rights (AVG/GDPR)</h3>
              <p className="text-gray-600 mb-2">
                You have the right to access, correct, or request deletion of your data.
              </p>
              <p className="text-gray-600">
                Contact us at:{" "}
                <span className="font-medium text-gray-800">privacy@lastapas.nl</span>
              </p>
            </section>

            <section className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 text-xs">
                This notice is provided in accordance with the EU General Data Protection
                Regulation (GDPR / AVG). By continuing, you confirm you are at least 16
                years old or have parental consent.
              </p>
            </section>

            {/* Scroll indicator */}
            {!hasScrolled && (
              <p className="text-center text-xs text-gray-400 animate-bounce">
                Scroll down to read the full notice
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={handleAccept}
              disabled={!hasScrolled}
              className="w-full py-3 rounded-xl font-bold text-white text-base transition-all duration-200"
              style={{
                background: hasScrolled
                  ? "linear-gradient(135deg, #F95E07, #DB8555)"
                  : "#d1d5db",
                cursor: hasScrolled ? "pointer" : "not-allowed",
              }}
            >
              I Agree & Continue
            </button>
            {!hasScrolled && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Please scroll through the full notice to continue
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
