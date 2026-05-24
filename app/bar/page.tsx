'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import BarAuthGuard from './components/BarAuthGuard';
import { useSSE } from '@/app/hooks/useSSE';
import { endpoints } from '@/app/api/endpoint';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FoodItem {
  foodId: string;
  name: string;
  quantity: number;
  category: string;
  modification?: string;
  price: number;
}

interface OrderData {
  orderId: string;
  sessionId: string;
  tableNumber: string;
  guestName?: string;
  foodItems: FoodItem[];
  status: 'ordered' | 'preparing' | 'ready';
  payment: 'paid' | 'unpaid' | 'wantToPay';
  timestamps?: { orderedAt?: string };
}

interface MenuItem {
  _id: string;
  foodId: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  alcoholic?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  modification: string;
}

interface TableInfo {
  tableNumber: string;
  occupiedBy: string[];
}

interface GuestInfo {
  sessionId: string;
  guestName: string;
  tableNumber: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function elapsed(ts?: string): string {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const STATUS_CONFIG = {
  ordered:   { label: 'NEW',       bg: 'bg-blue-500',  border: 'border-blue-500',  btn: 'Start Making',  btnBg: 'bg-blue-500 hover:bg-blue-600' },
  preparing: { label: 'MAKING',    bg: 'bg-amber-500', border: 'border-amber-500', btn: 'Mark Ready',    btnBg: 'bg-amber-500 hover:bg-amber-600' },
  ready:     { label: 'READY ✓',  bg: 'bg-emerald-500', border: 'border-emerald-500', btn: 'Done',       btnBg: 'bg-emerald-500 hover:bg-emerald-600' },
} as const;

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onUpdate,
}: {
  order: OrderData;
  onUpdate: (orderId: string, sessionId: string, status: 'preparing' | 'ready') => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.ordered;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleAction = async () => {
    if (order.status === 'ready') return;
    setBusy(true);
    try {
      const next = order.status === 'ordered' ? 'preparing' : 'ready';
      await onUpdate(order.orderId, order.sessionId, next);
    } finally {
      setBusy(false);
    }
  };

  const employeeId   = typeof window !== 'undefined' ? sessionStorage.getItem('employeeId')   ?? '' : '';
  const employeeName = typeof window !== 'undefined' ? sessionStorage.getItem('employeeName') ?? '' : '';

  const handleUpdateWithEmployee = async (
    orderId: string,
    sessionId: string,
    status: 'preparing' | 'ready'
  ) => {
    await fetch(`/api/orders/updateOrderStatus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sessionId, status, employeeId, employeeName }),
    });
  };

  return (
    <div className={`flex flex-col bg-slate-800 rounded-2xl overflow-hidden border-t-4 ${cfg.border} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700">
        <div>
          <span className="text-white font-bold text-lg">#{order.orderId}</span>
          <span className="ml-2 text-slate-300 text-sm">· {order.tableNumber}</span>
          {order.guestName && (
            <span className="ml-1 text-slate-400 text-xs">({order.guestName})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {order.timestamps?.orderedAt && (
            <span className="text-slate-400 text-xs tabular-nums">
              ⏱ {elapsed(order.timestamps.orderedAt)}
            </span>
          )}
          <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2 flex-1">
        {order.foodItems.map((item) => (
          <div key={item.foodId} className="flex items-start justify-between">
            <div>
              <span className="text-white font-medium">{item.name}</span>
              {item.modification && (
                <p className="text-slate-400 text-xs mt-0.5 italic">"{item.modification}"</p>
              )}
            </div>
            <span className="text-slate-300 font-bold text-lg ml-4">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Action */}
      {order.status !== 'ready' && (
        <div className="px-4 pb-4">
          <button
            onClick={() => handleAction().then(() => handleUpdateWithEmployee(order.orderId, order.sessionId, order.status === 'ordered' ? 'preparing' : 'ready'))}
            disabled={busy}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all ${cfg.btnBg} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {busy ? 'Updating…' : cfg.btn}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── New Order Panel ───────────────────────────────────────────────────────────

function NewOrderPanel({ onOrderPlaced }: { onOrderPlaced: () => void }) {
  const [step, setStep] = useState<'table' | 'items' | 'confirm'>('table');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [guestName, setGuestName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const employeeId = typeof window !== 'undefined' ? sessionStorage.getItem('employeeId') ?? '' : '';

  useEffect(() => {
    fetch('/api/tables').then((r) => r.json()).then(setTables).catch(() => {});
    fetch('/api/menu/drinks').then((r) => r.json()).then(setMenu).catch(() => {});
  }, []);

  const handleTableSelect = async (tableNumber: string) => {
    setSelectedTable(tableNumber);
    try {
      const res = await fetch('/api/guests');
      const data: GuestInfo[] = await res.json();
      setGuests(data.filter((g) => g.tableNumber === tableNumber));
    } catch { /* ignore */ }
    setStep('items');
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.foodId === item.foodId);
      if (existing) return prev.map((c) => c.foodId === item.foodId ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1, modification: '' }];
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.foodId === foodId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((c) => c.foodId !== foodId);
      return prev.map((c) => c.foodId === foodId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/staffOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          tableNumber: selectedTable,
          sessionId: selectedSession || undefined,
          guestName: guestName || undefined,
          items: cart.map((c) => ({
            foodId: c.foodId,
            name: c.name,
            quantity: c.quantity,
            price: c.price,
            category: c.category,
            modification: c.modification,
          })),
        }),
      });
      if (res.ok) {
        setCart([]);
        setSelectedTable('');
        setSelectedSession('');
        setGuestName('');
        setStep('table');
        onOrderPlaced();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = menu.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  return (
    <div className="h-full flex flex-col gap-4">
      {step === 'table' && (
        <div>
          <h2 className="text-white font-bold text-xl mb-4">Select Table</h2>
          <div className="grid grid-cols-4 gap-3">
            {tables.map((t) => (
              <button
                key={t.tableNumber}
                onClick={() => handleTableSelect(t.tableNumber)}
                className={`py-4 rounded-xl font-bold text-sm transition-all ${
                  t.occupiedBy.length > 0
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="text-lg">{t.tableNumber}</div>
                <div className="text-xs opacity-75">
                  {t.occupiedBy.length > 0 ? `${t.occupiedBy.length} guest${t.occupiedBy.length !== 1 ? 's' : ''}` : 'Empty'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'items' && (
        <div className="flex gap-4 h-full">
          {/* Left: menu */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('table')}
                className="text-slate-400 hover:text-white text-sm"
              >
                ← Back
              </button>
              <span className="text-white font-bold">
                Table {selectedTable}
              </span>
              {guests.length > 0 && (
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1 border border-slate-600"
                >
                  <option value="">No specific guest</option>
                  {guests.map((g) => (
                    <option key={g.sessionId} value={g.sessionId}>
                      {g.guestName || `Seat ${g.sessionId.slice(-4)}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <input
              type="text"
              placeholder="Search drinks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:outline-none focus:border-orange-500 placeholder-slate-400"
            />

            <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pb-4">
              {filtered.map((item) => {
                const inCart = cart.find((c) => c.foodId === item.foodId);
                return (
                  <button
                    key={item.foodId}
                    onClick={() => addToCart(item)}
                    className="bg-slate-700 hover:bg-slate-600 rounded-xl p-3 text-left transition-all border border-slate-600 hover:border-orange-500 relative"
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                    <p className="text-white font-medium text-sm leading-tight">{item.name}</p>
                    <p className="text-slate-400 text-xs mt-1">€{item.price.toFixed(2)}</p>
                    {item.alcoholic && (
                      <span className="text-xs text-amber-400">🍷 Alcoholic</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: cart */}
          <div className="w-64 flex flex-col bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <h3 className="text-white font-bold mb-3">Order ({cart.length})</h3>

            <input
              type="text"
              placeholder="Guest name (optional)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-orange-500 placeholder-slate-500 mb-3"
            />

            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <p className="text-slate-500 text-sm text-center mt-4">Tap items to add</p>
              ) : (
                cart.map((item) => (
                  <div key={item.foodId} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-slate-400 text-xs">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => removeFromCart(item.foodId)}
                        className="w-6 h-6 bg-slate-600 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-6 h-6 bg-slate-600 hover:bg-green-600 text-white rounded-full text-xs font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-3 border-t border-slate-700 pt-3">
                <div className="flex justify-between text-white text-sm mb-3">
                  <span>Total</span>
                  <span className="font-bold">€{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting ? 'Placing…' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Bar Page ─────────────────────────────────────────────────────────────

type Tab = 'orders' | 'new' | 'done';

export default function BarPage() {
  const [tab, setTab] = useState<Tab>('orders');
  const [time, setTime] = useState(new Date());
  const [notification, setNotification] = useState<string | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const sseUrl = `/api/sse?channel=bar`;
  const { data: orders, connected } = useSSE<OrderData[]>(sseUrl);
  const doneUrl = `/api/sse?channel=done`;

  // New order notification
  useEffect(() => {
    if (!orders) return;
    const newOrdered = orders.filter((o) => o.status === 'ordered').length;
    if (newOrdered > prevCountRef.current && prevCountRef.current > 0) {
      setNotification(`${newOrdered - prevCountRef.current} new drink order(s)!`);
      setTimeout(() => setNotification(null), 4000);
    }
    prevCountRef.current = newOrdered;
  }, [orders]);

  const activeOrders = orders?.filter((o) => o.status !== 'ready') ?? [];
  const readyOrders = orders?.filter((o) => o.status === 'ready') ?? [];
  const displayOrders = tab === 'done' ? readyOrders : activeOrders;

  const handleUpdateStatus = useCallback(
    async (orderId: string, sessionId: string, status: 'preparing' | 'ready') => {
      const employeeId = sessionStorage.getItem('employeeId') ?? '';
      await fetch('/api/orders/updateOrderStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, sessionId, status, employeeId }),
      });
    },
    []
  );

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'orders', label: 'Active', count: activeOrders.length },
    { key: 'new',    label: '+ New Order' },
    { key: 'done',   label: 'Ready', count: readyOrders.length },
  ];

  return (
    <BarAuthGuard>
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <span className="text-white text-lg">🍺</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">Bar</h1>
              <p className="text-slate-400 text-xs">Las Tapas · Drinks</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
            <div className="text-right">
              <p className="text-white font-mono text-xl font-bold">
                {time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-slate-400 text-xs">
                {time.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </header>

        {/* Notification toast */}
        {notification && (
          <div className="mx-6 mt-4 bg-blue-500 text-white px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shrink-0">
            <span>🔔</span> {notification}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-slate-600'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
          {tab === 'new' ? (
            <NewOrderPanel onOrderPlaced={() => setTab('orders')} />
          ) : (
            <div>
              {displayOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                  <span className="text-5xl">✓</span>
                  <p className="text-lg font-medium">
                    {tab === 'done' ? 'No ready orders' : 'No active drink orders'}
                  </p>
                  {!connected && <p className="text-sm text-red-400">Reconnecting…</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayOrders.map((order) => (
                    <OrderCard
                      key={order.orderId}
                      order={order}
                      onUpdate={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </BarAuthGuard>
  );
}
