'use client';
import React, { useState, useEffect } from 'react';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import AuthGuard from '../components/AuthGuard';

interface FoodItem {
  name:         string;
  quantity:     number;
  price:        number;
  modification: string;
}

interface Order {
  orderId:     string;
  tableNumber: string;
  status:      'ordered' | 'preparing' | 'ready' | 'served';
  payment:     'paid' | 'unpaid' | 'wantToPay';
  foodItems:   FoodItem[];
  timestamps:  { orderedAt: string };
}

const STATUS_STYLE: Record<Order['status'], string> = {
  ordered:   'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready:     'bg-green-100 text-green-700',
  served:    'bg-gray-100 text-gray-600',
};

const PAYMENT_STYLE: Record<Order['payment'], string> = {
  paid:       'bg-emerald-100 text-emerald-700',
  unpaid:     'bg-red-100 text-red-600',
  wantToPay:  'bg-orange-100 text-orange-700',
};

const PAYMENT_LABEL: Record<Order['payment'], string> = {
  paid:      'Paid',
  unpaid:    'Unpaid',
  wantToPay: 'Awaiting payment',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function OrderHistory() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      setError('No session found. Please scan your QR code.');
      setLoading(false);
      return;
    }
    fetch(`/api/orders/clientOrderlistOrdered?sessionId=${sessionId}`)
      .then(r => r.ok ? r.json() : r.json().then((d: { message?: string }) => Promise.reject(d.message || 'Failed')))
      .then((data: Order[]) => setOrders(data))
      .catch((e: unknown) => setError(typeof e === 'string' ? e : 'Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-screen bg-gray-50">
        <TopNavBar />

        <div className="flex-1 px-3 pt-4 pb-28 max-w-lg mx-auto w-full">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-sm text-center text-red-500">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400">
              <p className="text-5xl mb-3">📋</p>
              <p className="text-base font-medium">No orders yet</p>
              <p className="text-sm mt-1">Your orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const total = order.foodItems.reduce((s, i) => s + i.price * i.quantity, 0);
                return (
                  <div key={order.orderId}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[order.status]}`}>
                          {order.status}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${PAYMENT_STYLE[order.payment]}`}>
                          {PAYMENT_LABEL[order.payment]}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(order.timestamps.orderedAt)}</span>
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 space-y-2">
                      {order.foodItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-sm text-gray-800 leading-snug">
                              {item.name}
                              <span className="text-gray-400"> ×{item.quantity}</span>
                            </p>
                            {item.modification && item.modification !== 'none' && (
                              <p className="text-xs text-gray-400 italic mt-0.5">{item.modification}</p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Table {order.tableNumber}</span>
                      <span className="font-bold text-sm text-gray-900">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <BottomNavBar />

        <footer className="px-4 py-3 border-t border-gray-100 bg-white text-center">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Order data is processed solely to manage your visit. Session data removed after your visit.
            Records kept 30 days. · <span className="underline">privacy@lastapas.nl</span>
          </p>
        </footer>
      </main>
    </AuthGuard>
  );
}
