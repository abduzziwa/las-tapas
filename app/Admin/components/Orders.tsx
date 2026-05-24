"use client";
import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, Search } from "lucide-react";

interface FoodItem {
  foodId: string;
  name: string;
  quantity: number;
  modification?: string;
  price: number;
  category: "food" | "drink" | "dessert";
}

interface Order {
  orderId: string;
  sessionId: string;
  tableNumber: string;
  seatNumber?: string;
  guestName?: string;
  foodItems: FoodItem[];
  status: "notYetOrdered" | "ordered" | "preparing" | "ready" | "served";
  payment: "paid" | "unpaid" | "wantToPay";
  paymentMethod?: string;
  timestamps: {
    orderedAt?: string;
    preparingAt?: string;
    readyAt?: string;
    servedAt?: string;
  };
}

type StatusFilter = "all" | Order["status"];

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  notYetOrdered: { label: "Draft",      cls: "bg-gray-100 text-gray-600"     },
  ordered:       { label: "Ordered",    cls: "bg-blue-100 text-blue-700"     },
  preparing:     { label: "Preparing",  cls: "bg-amber-100 text-amber-700"   },
  ready:         { label: "Ready",      cls: "bg-violet-100 text-violet-700" },
  served:        { label: "Served",     cls: "bg-green-100 text-green-700"   },
};

const PAYMENT_STYLE: Record<string, { label: string; cls: string }> = {
  unpaid:     { label: "Unpaid",      cls: "bg-gray-100 text-gray-500"    },
  wantToPay:  { label: "Wants to pay", cls: "bg-red-100 text-red-700"     },
  paid:       { label: "Paid",        cls: "bg-green-100 text-green-700"  },
};

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "ordered",  label: "Ordered"  },
  { id: "preparing",label: "Preparing"},
  { id: "ready",    label: "Ready"    },
  { id: "served",   label: "Served"   },
];

function totalFor(items: FoodItem[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1)  return "just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

export default function Orders() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<StatusFilter>("all");
  const [search,  setSearch]  = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server returned ${res.status}`);
      }
      setOrders(await res.json());
      setError(null);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 8000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const visible = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        String(o.orderId).includes(q) ||
        o.tableNumber.toLowerCase().includes(q) ||
        (o.guestName ?? "").toLowerCase().includes(q) ||
        o.foodItems.some(f => f.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Last refreshed {lastRefreshed.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · auto every 8 s
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Order, table, guest…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Manual refresh */}
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchOrders} className="ml-auto underline text-red-600 hover:text-red-800 text-xs font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 overflow-x-auto">
        {FILTER_TABS.map(({ id, label }) => {
          const count = id === "all"
            ? orders.length
            : orders.filter(o => o.status === id).length;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                filter === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                filter === id ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && visible.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-gray-500 font-medium">
            {search || filter !== "all" ? "No orders match your filter" : "No orders yet"}
          </p>
          {(search || filter !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-3 text-sm text-orange-500 hover:text-orange-600 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && visible.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Order", "Table", "Guest", "Items", "Total", "Status", "Payment", "Ordered"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map(order => {
                const st = STATUS_STYLE[order.status]  ?? { label: order.status,  cls: "bg-gray-100 text-gray-600" };
                const pt = PAYMENT_STYLE[order.payment] ?? { label: order.payment, cls: "bg-gray-100 text-gray-600" };
                const total = totalFor(order.foodItems);
                return (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-700 font-medium">
                      #{order.orderId}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.tableNumber}
                      {order.seatNumber && (
                        <span className="ml-1 text-xs text-gray-400">{order.seatNumber}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">
                      {order.guestName || <span className="text-gray-400 italic text-xs">Guest</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[180px]">
                      <div className="space-y-0.5">
                        {order.foodItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs">
                            <span className="font-medium">{item.quantity}×</span>
                            <span className="truncate">{item.name}</span>
                            {item.modification && (
                              <span className="text-gray-400 italic truncate">({item.modification})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 tabular-nums">
                      €{total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${pt.cls}`}>
                        {pt.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap tabular-nums">
                      {timeAgo(order.timestamps?.orderedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
