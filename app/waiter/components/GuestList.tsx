"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { endpoints } from "@/app/api/endpoint";

interface Guest {
  sessionId: string;
  guestName: string;
  tableNumber: string;
  seatNumber: string;
  orderCount: number;
  latestStatus: string | null;
  latestPayment: string | null;
  joinedAt: string;
}

const statusColors: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-700",
  preparing: "bg-yellow-100 text-yellow-700",
  ready: "bg-green-100 text-green-700",
  served: "bg-gray-100 text-gray-500",
};

const paymentColors: Record<string, string> = {
  unpaid: "bg-red-100 text-red-600",
  wantToPay: "bg-orange-100 text-orange-600",
  paid: "bg-green-100 text-green-700",
};

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const guestsRef = useRef<Guest[]>([]);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch(`http://${endpoints.next_ip_port}/api/guests`);
      const data: Guest[] = await res.json();
      if (!Array.isArray(data)) return;

      if (JSON.stringify(data) !== JSON.stringify(guestsRef.current)) {
        guestsRef.current = data;
        setGuests(data);
      }
    } catch {
      // silent — guests panel is informational
    }
  }, []);

  useEffect(() => {
    fetchGuests();
    const id = setInterval(fetchGuests, 5000);
    return () => clearInterval(id);
  }, [fetchGuests]);

  // Group by table for display
  const byTable = guests.reduce<Record<string, Guest[]>>((acc, g) => {
    if (!acc[g.tableNumber]) acc[g.tableNumber] = [];
    acc[g.tableNumber].push(g);
    return acc;
  }, {});

  if (guests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-400 gap-2">
        <span className="text-5xl">🪑</span>
        <p className="text-lg font-medium">No guests seated right now</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Current Guests</h2>
        <span className="text-sm text-gray-400">{guests.length} guest{guests.length !== 1 ? "s" : ""} seated · refreshes every 5s</span>
      </div>

      {Object.entries(byTable).map(([tableNumber, tableGuests]) => (
        <div key={tableNumber} className="border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div
            className="px-4 py-2 font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #F95E07, #DB8555)" }}
          >
            Table {tableNumber} — {tableGuests.length} seat{tableGuests.length !== 1 ? "s" : ""}
          </div>

          {/* Guest rows */}
          <div className="divide-y divide-gray-100">
            {tableGuests.map((guest) => (
              <div key={guest.sessionId} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                {/* Left: name + seat */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                    {guest.guestName ? guest.guestName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {guest.guestName || <span className="italic text-gray-400 font-normal">Anonymous</span>}
                    </p>
                    <p className="text-xs text-gray-400">Seat {guest.seatNumber}</p>
                  </div>
                </div>

                {/* Right: order count + status badges */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-xs text-gray-500">
                    {guest.orderCount} order{guest.orderCount !== 1 ? "s" : ""}
                  </span>
                  {guest.latestStatus && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[guest.latestStatus] ?? "bg-gray-100 text-gray-500"}`}>
                      {guest.latestStatus}
                    </span>
                  )}
                  {guest.latestPayment && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentColors[guest.latestPayment] ?? "bg-gray-100 text-gray-500"}`}>
                      {guest.latestPayment === "wantToPay" ? "wants to pay 💰" : guest.latestPayment}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
