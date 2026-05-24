'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import WaiterAuthGuard from './components/WaiterAuthGuard';
import { useSSE } from '@/app/hooks/useSSE';

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

interface PaymentOrder {
  orderId: string;
  sessionId: string;
  tableNumber: string;
  guestName?: string;
  foodItems: FoodItem[];
  status: string;
  payment: string;
}

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

interface MenuItem {
  _id: string;
  foodId: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  modification: string;
}

interface TableInfo {
  tableNumber: string;
  occupiedBy: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function elapsed(ts?: string): string {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  return `${m}m ago`;
}

function orderTotal(items: FoodItem[]): number {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

// ─── Waiter Order Card ────────────────────────────────────────────────────────

function WaiterOrderCard({
  order,
  onServe,
}: {
  order: OrderData;
  onServe: (orderId: string, sessionId: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const statusConfig = {
    ordered:   { label: 'Ordered',   bg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    preparing: { label: 'Preparing', bg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    ready:     { label: 'Ready ✓',  bg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  };
  const cfg = statusConfig[order.status] ?? statusConfig.ordered;

  const handleServe = async () => {
    setBusy(true);
    try { await onServe(order.orderId, order.sessionId); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50">
        <div>
          <span className="text-white font-bold">#{order.orderId}</span>
          <span className="ml-2 text-slate-300 text-sm">{order.tableNumber}</span>
          {order.guestName && <span className="ml-1 text-slate-400 text-xs">· {order.guestName}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">{elapsed(order.timestamps?.orderedAt)}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-1.5">
        {order.foodItems.map((item) => (
          <div key={item.foodId} className="flex justify-between items-start text-sm">
            <div>
              <span className="text-white">{item.name}</span>
              {item.modification && (
                <span className="text-slate-400 text-xs ml-1 italic">"{item.modification}"</span>
              )}
            </div>
            <span className="text-slate-300 font-bold ml-3">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {order.status === 'ready' && (
        <div className="px-4 pb-4">
          <button
            onClick={handleServe}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all disabled:opacity-50"
          >
            {busy ? 'Marking…' : '✓ Mark as Served'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Payment Card ─────────────────────────────────────────────────────────────

function PaymentCard({
  order,
  onMarkPaid,
}: {
  order: PaymentOrder;
  onMarkPaid: (orderId: string, sessionId: string, method: string) => Promise<void>;
}) {
  const [method, setMethod] = useState<'pin' | 'cash' | 'tikkie'>('pin');
  const [busy, setBusy] = useState(false);
  const total = orderTotal(order.foodItems);

  const handlePay = async () => {
    setBusy(true);
    try { await onMarkPaid(order.orderId, order.sessionId, method); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden border border-orange-500/30">
      <div className="flex items-center justify-between px-4 py-3 bg-orange-500/10">
        <div>
          <span className="text-white font-bold">#{order.orderId}</span>
          <span className="ml-2 text-slate-300 text-sm">{order.tableNumber}</span>
          {order.guestName && <span className="ml-1 text-slate-400 text-xs">· {order.guestName}</span>}
        </div>
        <span className="text-orange-400 text-sm font-bold">Wants to pay 💰</span>
      </div>

      <div className="px-4 py-3 space-y-1.5">
        {order.foodItems.map((item) => (
          <div key={item.foodId} className="flex justify-between text-sm">
            <span className="text-slate-300">{item.name} ×{item.quantity}</span>
            <span className="text-slate-400">€{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-white border-t border-slate-700 pt-2 mt-2">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="flex gap-2">
          {(['pin', 'cash', 'tikkie'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                method === m ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {m === 'pin' ? '💳 PIN' : m === 'cash' ? '💵 Cash' : '📱 Tikkie'}
            </button>
          ))}
        </div>
        <button
          onClick={handlePay}
          disabled={busy}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all disabled:opacity-50"
        >
          {busy ? 'Processing…' : '✓ Mark as Paid'}
        </button>
      </div>
    </div>
  );
}

// ─── Guest Row ────────────────────────────────────────────────────────────────

function GuestRow({
  guest,
  onTakeOrder,
}: {
  guest: Guest;
  onTakeOrder: (sessionId: string, tableNumber: string) => void;
}) {
  const statusColors: Record<string, string> = {
    ordered:   'bg-blue-500/20 text-blue-300',
    preparing: 'bg-amber-500/20 text-amber-300',
    ready:     'bg-emerald-500/20 text-emerald-300',
    served:    'bg-slate-600 text-slate-400',
  };
  const payColors: Record<string, string> = {
    unpaid:    'bg-red-500/20 text-red-400',
    wantToPay: 'bg-orange-500/20 text-orange-400',
    paid:      'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {guest.guestName ? guest.guestName[0].toUpperCase() : '?'}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            {guest.guestName || <span className="text-slate-400 italic font-normal">Anonymous</span>}
          </p>
          <p className="text-slate-400 text-xs">
            {guest.tableNumber} · Seat {guest.seatNumber} · {guest.orderCount} order{guest.orderCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {guest.latestStatus && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[guest.latestStatus] ?? 'bg-slate-700 text-slate-400'}`}>
            {guest.latestStatus}
          </span>
        )}
        {guest.latestPayment && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payColors[guest.latestPayment] ?? 'bg-slate-700 text-slate-400'}`}>
            {guest.latestPayment === 'wantToPay' ? '💰 wants to pay' : guest.latestPayment}
          </span>
        )}
        <button
          onClick={() => onTakeOrder(guest.sessionId, guest.tableNumber)}
          className="ml-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all"
        >
          + Order
        </button>
      </div>
    </div>
  );
}

// ─── New Order Panel ───────────────────────────────────────────────────────────

function NewOrderPanel({
  preselectedSession,
  preselectedTable,
  onClose,
  onOrderPlaced,
}: {
  preselectedSession?: string;
  preselectedTable?: string;
  onClose: () => void;
  onOrderPlaced: () => void;
}) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState(preselectedTable ?? '');
  const [selectedSession, setSelectedSession] = useState(preselectedSession ?? '');
  const [guestName, setGuestName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'drink' | 'dessert'>('all');
  const [submitting, setSubmitting] = useState(false);
  const employeeId = typeof window !== 'undefined' ? sessionStorage.getItem('employeeId') ?? '' : '';

  useEffect(() => {
    fetch('/api/tables').then((r) => r.json()).then(setTables).catch(() => {});
    fetch('/api/menu').then((r) => r.json()).then(setMenu).catch(() => {});
    fetch('/api/guests').then((r) => r.json()).then(setGuests).catch(() => {});
  }, []);

  const filtered = menu.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const tableGuests = guests.filter((g) => g.tableNumber === selectedTable);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.foodId === item.foodId);
      if (ex) return prev.map((c) => c.foodId === item.foodId ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1, modification: '' }];
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.foodId === foodId);
      if (!ex) return prev;
      if (ex.quantity === 1) return prev.filter((c) => c.foodId !== foodId);
      return prev.map((c) => c.foodId === foodId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !selectedTable) return;
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
        onOrderPlaced();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const categories: Array<{ key: 'all' | 'food' | 'drink' | 'dessert'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'food', label: '🍽 Food' },
    { key: 'drink', label: '🍺 Drinks' },
    { key: 'dessert', label: '🍮 Desserts' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-slate-700">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <h2 className="text-white font-bold text-xl">Take Order</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: table + menu */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-700">
            {/* Table + guest selector */}
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1 block">Table</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => {
                      setSelectedTable(e.target.value);
                      setSelectedSession('');
                    }}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select table…</option>
                    {tables.map((t) => (
                      <option key={t.tableNumber} value={t.tableNumber}>
                        {t.tableNumber} {t.occupiedBy.length > 0 ? `(${t.occupiedBy.length} guests)` : '(empty)'}
                      </option>
                    ))}
                  </select>
                </div>
                {tableGuests.length > 0 && (
                  <div className="flex-1">
                    <label className="text-slate-400 text-xs mb-1 block">Guest</label>
                    <select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-orange-500"
                    >
                      <option value="">No specific guest</option>
                      {tableGuests.map((g) => (
                        <option key={g.sessionId} value={g.sessionId}>
                          {g.guestName || `Seat ${g.seatNumber}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1 block">Name (optional)</label>
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest name…"
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-orange-500 placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Category + Search */}
            <div className="px-4 py-3 border-b border-slate-700 shrink-0 space-y-2">
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === cat.key
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu…"
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-orange-500 placeholder-slate-500"
              />
            </div>

            {/* Menu grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 overflow-y-auto flex-1">
              {filtered.map((item) => {
                const inCart = cart.find((c) => c.foodId === item.foodId);
                return (
                  <button
                    key={item.foodId}
                    onClick={() => addToCart(item)}
                    className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left border border-slate-700 hover:border-orange-500 transition-all relative"
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mb-1 inline-block ${
                      item.category === 'food' ? 'bg-blue-500/20 text-blue-300' :
                      item.category === 'drink' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-pink-500/20 text-pink-300'
                    }`}>
                      {item.category}
                    </span>
                    <p className="text-white font-medium text-sm leading-tight mt-1">{item.name}</p>
                    <p className="text-orange-400 text-sm font-bold mt-1">€{item.price.toFixed(2)}</p>
                    {item.description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: cart */}
          <div className="w-72 flex flex-col bg-slate-800">
            <div className="px-4 py-3 border-b border-slate-700 shrink-0">
              <h3 className="text-white font-bold">Cart ({cart.length} items)</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.length === 0 ? (
                <p className="text-slate-500 text-sm text-center mt-8">Tap items to add</p>
              ) : (
                cart.map((item) => (
                  <div key={item.foodId} className="bg-slate-700 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-white text-sm font-medium leading-tight flex-1 pr-2">{item.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => removeFromCart(item.foodId)} className="w-6 h-6 bg-slate-600 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors">−</button>
                        <span className="text-white text-sm w-4 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-6 h-6 bg-slate-600 hover:bg-green-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors">+</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        placeholder="Note…"
                        value={item.modification}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCart((prev) => prev.map((c) => c.foodId === item.foodId ? { ...c, modification: val } : c));
                        }}
                        className="bg-slate-600 text-slate-300 rounded px-2 py-1 text-xs w-full mr-2 focus:outline-none placeholder-slate-500"
                      />
                      <span className="text-orange-400 text-sm font-bold shrink-0">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-700 shrink-0">
              <div className="flex justify-between text-white font-bold mb-4">
                <span>Total</span>
                <span className="text-orange-400">€{total.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || cart.length === 0 || !selectedTable}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
              >
                {submitting ? 'Placing…' : 'Place Order'}
              </button>
              {!selectedTable && cart.length > 0 && (
                <p className="text-amber-400 text-xs text-center mt-2">Select a table first</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Waiter Page ─────────────────────────────────────────────────────────

type Tab = 'orders' | 'payments' | 'guests' | 'new';

export default function WaiterPage() {
  const [tab, setTab] = useState<Tab>('orders');
  const [time, setTime] = useState(new Date());
  const [guests, setGuests] = useState<Guest[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrderPreselect, setNewOrderPreselect] = useState<{ session?: string; table?: string }>({});
  const prevPayRef = useRef(0);
  const [payNotification, setPayNotification] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // SSE for active orders
  const { data: orders, connected } = useSSE<OrderData[]>('/api/sse?channel=waiter');

  // Poll payment requests (every 3s — lightweight)
  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/waiterOrderlistWantToPay');
      const data = await res.json();
      if (Array.isArray(data)) {
        if (data.length > prevPayRef.current) {
          const diff = data.length - prevPayRef.current;
          setPayNotification(`${diff} new payment request${diff > 1 ? 's' : ''}!`);
          setTimeout(() => setPayNotification(null), 5000);
        }
        prevPayRef.current = data.length;
        setPaymentOrders(data);
      }
    } catch { /* silent */ }
  }, []);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch('/api/guests');
      const data = await res.json();
      if (Array.isArray(data)) setGuests(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchGuests();
    const payId = setInterval(fetchPayments, 3000);
    const guestId = setInterval(fetchGuests, 5000);
    return () => { clearInterval(payId); clearInterval(guestId); };
  }, [fetchPayments, fetchGuests]);

  const handleServe = useCallback(async (orderId: string, sessionId: string) => {
    const employeeId   = sessionStorage.getItem('employeeId')   ?? '';
    const employeeName = sessionStorage.getItem('employeeName') ?? '';
    await fetch('/api/orders/updateOrderStatus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sessionId, status: 'served', employeeId, employeeName }),
    });
  }, []);

  const handleMarkPaid = useCallback(async (orderId: string, sessionId: string, method: string) => {
    const employeeId = sessionStorage.getItem('employeeId') ?? '';
    await fetch(`/api/orders/waiterOrderlistWantToPay?orderId=${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, paymentStatus: 'paid', employeeId, paymentMethod: method }),
    });
    setPaymentOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    prevPayRef.current = Math.max(0, prevPayRef.current - 1);
  }, []);

  const handleTakeOrderForGuest = (sessionId: string, tableNumber: string) => {
    setNewOrderPreselect({ session: sessionId, table: tableNumber });
    setShowNewOrder(true);
  };

  const readyOrders = orders?.filter((o) => o.status === 'ready') ?? [];
  const activeOrders = orders?.filter((o) => o.status !== 'ready') ?? [];
  const displayOrders = activeOrders;

  const tabs: Array<{ key: Tab; label: string; count?: number; alert?: boolean }> = [
    { key: 'orders',   label: 'Orders',   count: readyOrders.length > 0 ? readyOrders.length : activeOrders.length },
    { key: 'payments', label: 'Pay',      count: paymentOrders.length, alert: paymentOrders.length > 0 },
    { key: 'guests',   label: 'Guests',   count: guests.length },
    { key: 'new',      label: '+ Order' },
  ];

  return (
    <WaiterAuthGuard>
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-lg">🍽</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">Waiter</h1>
              <p className="text-orange-200 text-xs">Las Tapas</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-orange-100' : 'text-red-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-orange-200 animate-pulse' : 'bg-red-300'}`} />
              {connected ? 'Live' : 'Reconnecting'}
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-xl font-bold">
                {time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-orange-200 text-xs">
                {time.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </header>

        {/* Payment notification */}
        {payNotification && (
          <div className="mx-6 mt-4 bg-orange-500 text-white px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shrink-0">
            <span>💰</span> {payNotification}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-4 shrink-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => t.key === 'new' ? setShowNewOrder(true) : setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                tab === t.key && t.key !== 'new'
                  ? 'bg-orange-500 text-white'
                  : t.key === 'new'
                  ? 'bg-slate-700 text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  t.alert ? 'bg-orange-400 text-white animate-pulse' :
                  tab === t.key ? 'bg-white/20' : 'bg-slate-600 text-slate-300'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 px-4 pt-4 pb-6 overflow-y-auto">
          {tab === 'orders' && (
            <div>
              {/* Ready orders highlighted at top */}
              {readyOrders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-3">
                    🔔 Ready to Serve ({readyOrders.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readyOrders.map((o) => (
                      <WaiterOrderCard key={o.orderId} order={o} onServe={handleServe} />
                    ))}
                  </div>
                </div>
              )}

              {activeOrders.length > 0 && (
                <div>
                  <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-3">
                    Active Orders ({activeOrders.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeOrders.map((o) => (
                      <WaiterOrderCard key={o.orderId} order={o} onServe={handleServe} />
                    ))}
                  </div>
                </div>
              )}

              {readyOrders.length === 0 && activeOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                  <span className="text-5xl">✓</span>
                  <p className="text-lg font-medium">All caught up!</p>
                  {!connected && <p className="text-sm text-red-400">Reconnecting to live updates…</p>}
                </div>
              )}
            </div>
          )}

          {tab === 'payments' && (
            <div>
              {paymentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                  <span className="text-5xl">💰</span>
                  <p className="text-lg font-medium">No payment requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentOrders.map((o) => (
                    <PaymentCard key={o.orderId} order={o} onMarkPaid={handleMarkPaid} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'guests' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 font-bold">{guests.length} guest{guests.length !== 1 ? 's' : ''} seated</h3>
              </div>
              {guests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                  <span className="text-5xl">🪑</span>
                  <p className="text-lg font-medium">No guests seated</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guests.map((g) => (
                    <GuestRow key={g.sessionId} guest={g} onTakeOrder={handleTakeOrderForGuest} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* New Order Modal */}
        {showNewOrder && (
          <NewOrderPanel
            preselectedSession={newOrderPreselect.session}
            preselectedTable={newOrderPreselect.table}
            onClose={() => { setShowNewOrder(false); setNewOrderPreselect({}); }}
            onOrderPlaced={() => { setShowNewOrder(false); setNewOrderPreselect({}); }}
          />
        )}
      </div>
    </WaiterAuthGuard>
  );
}
