'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSSE } from '@/app/hooks/useSSE';
import WaiterAuthGuard from '../waiter/components/WaiterAuthGuard';

interface FoodItem {
  foodId: string;
  name: string;
  quantity: number;
  category: string;
  modification: string;
}

interface OrderData {
  _id: string;
  orderId: string;
  sessionId: string;
  tableNumber: string;
  guestName?: string;
  foodItems: FoodItem[];
  status: 'ordered' | 'preparing' | 'ready';
  timestamps: { orderedAt: string };
}

function elapsed(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}m ${s}s`;
}

function ElapsedBadge({ iso, status }: { iso: string; status: string }) {
  const [label, setLabel] = useState(() => elapsed(iso));
  useEffect(() => {
    const id = setInterval(() => setLabel(elapsed(iso)), 1000);
    return () => clearInterval(id);
  }, [iso]);

  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const urgent = status !== 'ready' && secs > 600;
  const warning = status !== 'ready' && secs > 300 && !urgent;

  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold ${
      urgent ? 'bg-red-900/60 text-red-200 animate-pulse' :
      warning ? 'bg-amber-900/60 text-amber-200' :
      'bg-zinc-700 text-zinc-300'
    }`}>
      {label}
    </span>
  );
}

function OrderCard({ order, onUpdate }: { order: OrderData; onUpdate: (orderId: string, sessionId: string, status: 'preparing' | 'ready') => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (order.status === 'ready') return;
    setLoading(true);
    try {
      await onUpdate(order.orderId, order.sessionId, order.status === 'ordered' ? 'preparing' : 'ready');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    ordered: { label: 'NEW', bg: 'bg-blue-500/20', border: 'border-blue-500/50', dot: 'bg-blue-400', btn: 'bg-amber-500 hover:bg-amber-400', btnText: 'Start Cooking' },
    preparing: { label: 'COOKING', bg: 'bg-amber-500/20', border: 'border-amber-500/50', dot: 'bg-amber-400 animate-pulse', btn: 'bg-green-500 hover:bg-green-400', btnText: 'Mark Ready' },
    ready: { label: 'READY', bg: 'bg-green-500/20', border: 'border-green-500/50', dot: 'bg-green-400', btn: 'bg-zinc-600 cursor-default', btnText: 'Completed' },
  };
  const cfg = statusConfig[order.status];

  const foodAndDessert = order.foodItems.filter(i => i.category === 'food' || i.category === 'dessert');

  return (
    <div className={`relative flex flex-col rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <span className="text-white font-bold text-lg tracking-wide">#{order.orderId}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80">{cfg.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-300 font-bold text-lg">{order.tableNumber}</span>
          <ElapsedBadge iso={order.timestamps.orderedAt} status={order.status} />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-3 space-y-2">
        {foodAndDessert.map((item) => (
          <div key={item.foodId} className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.quantity}
                </span>
                <span className="text-white font-medium text-sm truncate">{item.name}</span>
                {item.category === 'dessert' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 flex-shrink-0">dessert</span>
                )}
              </div>
              {item.modification && (
                <p className="text-amber-300/80 text-xs ml-8 mt-0.5 italic">{item.modification}</p>
              )}
            </div>
          </div>
        ))}
        {order.guestName && (
          <p className="text-zinc-500 text-xs mt-1">Guest: {order.guestName}</p>
        )}
      </div>

      {/* Action */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAction}
          disabled={loading || order.status === 'ready'}
          className={`w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all ${cfg.btn} disabled:opacity-60 flex items-center justify-center gap-2`}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : order.status === 'ordered' ? (
            <>{' '}Start Cooking</>
          ) : order.status === 'preparing' ? (
            <>Mark Ready</>
          ) : (
            <>Completed</>
          )}
        </button>
      </div>
    </div>
  );
}

function ChefPage() {
  const { data, connected } = useSSE<OrderData[]>('/api/sse?channel=chef');
  const [time, setTime] = useState(new Date());
  const employeeId   = typeof window !== 'undefined' ? sessionStorage.getItem('employeeId')   ?? '' : '';
  const employeeName = typeof window !== 'undefined' ? sessionStorage.getItem('employeeName') ?? '' : '';

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleUpdate = useCallback(async (orderId: string, sessionId: string, status: 'preparing' | 'ready') => {
    await fetch('/api/orders/updateOrderStatus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sessionId, status, employeeId, employeeName }),
    });
  }, [employeeId, employeeName]);

  const orders = data ?? [];
  const newOrders = orders.filter(o => o.status === 'ordered');
  const cooking = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-lg">
              🍳
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Kitchen Display</h1>
              <p className="text-zinc-400 text-xs">Las Tapas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Status counts */}
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                {newOrders.length} new
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {cooking.length} cooking
              </span>
              <span className="flex items-center gap-1.5 text-green-300">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                {ready.length} ready
              </span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${connected ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
              {connected ? 'Live' : 'Reconnecting'}
            </div>
            <span className="text-zinc-400 text-sm font-mono tabular-nums">
              {time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* New Orders */}
        {newOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-blue-300 font-bold text-sm uppercase tracking-widest">New Orders ({newOrders.length})</h2>
              <div className="flex-1 h-px bg-blue-900/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {newOrders.map(o => <OrderCard key={o.orderId} order={o} onUpdate={handleUpdate} />)}
            </div>
          </section>
        )}

        {/* Cooking */}
        {cooking.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-amber-300 font-bold text-sm uppercase tracking-widest">Cooking ({cooking.length})</h2>
              <div className="flex-1 h-px bg-amber-900/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cooking.map(o => <OrderCard key={o.orderId} order={o} onUpdate={handleUpdate} />)}
            </div>
          </section>
        )}

        {/* Ready */}
        {ready.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h2 className="text-green-300 font-bold text-sm uppercase tracking-widest">Ready for Service ({ready.length})</h2>
              <div className="flex-1 h-px bg-green-900/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ready.map(o => <OrderCard key={o.orderId} order={o} onUpdate={handleUpdate} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-xl font-semibold">All clear in the kitchen</p>
            <p className="text-sm mt-1">No active orders right now</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <WaiterAuthGuard>
      <ChefPage />
    </WaiterAuthGuard>
  );
}
