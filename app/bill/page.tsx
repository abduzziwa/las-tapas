'use client';
import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import AuthGuard from '../components/AuthGuard';

interface BillItem {
  foodId:       string;
  name:         string;
  quantity:     number;
  modification: string;
  price:        number;
  category?:    Category;
}

interface Order {
  orderId:   string;
  foodItems: BillItem[];
  payment:   'paid' | 'unpaid' | 'wantToPay';
}

type Category = 'food' | 'drink' | 'dessert';
const CATEGORIES: Category[] = ['food', 'drink', 'dessert'];
const CAT_LABELS: Record<Category, string> = { food: 'Food', drink: 'Drinks', dessert: 'Desserts' };
const CAT_EMOJI:  Record<Category, string> = { food: '🍽️', drink: '🥤', dessert: '🍰' };

export default function Bill() {
  const [allItems,       setAllItems]       = useState<BillItem[]>([]);
  const [orders,         setOrders]         = useState<Order[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [isPaying,       setIsPaying]       = useState(false);
  const [isTikkieLoading,setIsTikkieLoading]= useState(false);
  const [tikkieUrl,      setTikkieUrl]      = useState<string | null>(null);
  const [exitQrUrl,      setExitQrUrl]      = useState<string | null>(null);
  const [showExitQr,     setShowExitQr]     = useState(false);
  const [expanded, setExpanded]             = useState<Record<Category, boolean>>({
    food: true, drink: true, dessert: true,
  });

  const isPending = orders.some(o => o.payment === 'wantToPay');

  const fetchBill = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/orders/clientOrderlistOrdered?sessionId=${sessionId}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch bill');
    return res.json() as Promise<Order[]>;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) { toast.error('No session found. Please scan your QR code.'); return; }
        const fetched = await fetchBill(sessionId);
        setOrders(fetched);
        setAllItems(fetched.filter(o => o.payment !== 'paid').flatMap(o => o.foodItems));
        if (fetched.some(o => o.payment === 'wantToPay')) loadExitQr(sessionId);
      } catch { toast.error('Could not load your bill.'); }
      finally { setLoading(false); }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadExitQr = async (sessionId: string) => {
    if (exitQrUrl) return;
    try {
      const res = await fetch(`/api/checkout/token?sessionId=${sessionId}`);
      if (res.ok) setExitQrUrl((await res.json()).checkoutUrl);
    } catch { /* silent */ }
  };

  const handlePayRequest = async () => {
    setIsPaying(true);
    try {
      const sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) { toast.error('No session found.'); return; }

      const unpaidIds = orders.filter(o => o.payment === 'unpaid').map(o => o.orderId);
      if (!unpaidIds.length) { toast.warning('No unpaid orders found.'); return; }

      const res = await fetch(`/api/orders/iwantToPay?orderIds=${unpaidIds.join(',')}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Failed to request payment'); return; }

      const updated = await fetchBill(sessionId);
      setOrders(updated);
      setAllItems(updated.filter(o => o.payment !== 'paid').flatMap(o => o.foodItems));
      await loadExitQr(sessionId);
      toast.success('Payment request sent! Your waiter is on the way.');
    } catch { toast.error('Failed to request payment.'); }
    finally { setIsPaying(false); }
  };

  const handleTikkie = async () => {
    setIsTikkieLoading(true);
    try {
      const sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) { toast.error('No session found.'); return; }
      const res  = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Could not create Tikkie link'); return; }
      setTikkieUrl(data.url);
      if (data.demo) toast.info('Demo mode — no real Tikkie credentials configured');
    } catch { toast.error('Failed to create Tikkie link.'); }
    finally { setIsTikkieLoading(false); }
  };

  const filterByCat = (cat: Category) => allItems.filter(i => i.category === cat);
  const catTotal    = (cat: Category) =>
    filterByCat(cat).reduce((s, i) => s + i.price * i.quantity, 0);
  const grandTotal  = allItems.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading) {
    return (
      <AuthGuard>
        <main className="flex min-h-screen flex-col bg-gray-50">
          <TopNavBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <BottomNavBar />
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-screen bg-gray-50">
        <TopNavBar />
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

        <div className="flex-1 px-3 pt-4 pb-36 max-w-lg mx-auto w-full">
          {allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400">
              <p className="text-5xl mb-3">🧾</p>
              <p className="text-base font-medium">No outstanding items</p>
              <p className="text-sm mt-1">Everything looks settled!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {CATEGORIES.map(cat => {
                const items = filterByCat(cat);
                if (!items.length) return null;
                const total = catTotal(cat);
                const open  = expanded[cat];
                return (
                  <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3.5"
                      onClick={() => setExpanded(e => ({ ...e, [cat]: !e[cat] }))}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{CAT_EMOJI[cat]}</span>
                        <span className="font-semibold text-gray-900">{CAT_LABELS[cat]}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">€{total.toFixed(2)}</span>
                        {open
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </button>
                    {open && (
                      <div className="border-t border-gray-100 px-4 py-2 space-y-2">
                        {items.map((item, idx) => (
                          <div key={`${item.foodId}-${idx}`} className="flex justify-between items-start py-1.5">
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="text-sm text-gray-800 leading-snug">
                                {item.name}
                                <span className="text-gray-400 font-normal"> ×{item.quantity}</span>
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
                    )}
                  </div>
                );
              })}

              {/* Grand total */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-black text-gray-900 text-xl">€{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Payment pending */}
          {isPending && allItems.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-center">
                <p className="text-amber-700 font-semibold text-sm">Payment requested</p>
                <p className="text-amber-600 text-xs mt-0.5">Your waiter is on the way. You can also pay below.</p>
              </div>

              {!tikkieUrl ? (
                <button onClick={handleTikkie} disabled={isTikkieLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#0075E5] text-white font-semibold text-sm disabled:opacity-60 active:opacity-80 transition-opacity">
                  {isTikkieLoading ? 'Creating link…' : '💸 Pay via Tikkie'}
                </button>
              ) : (
                <a href={tikkieUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#0075E5] text-white font-semibold text-sm active:opacity-80">
                  Open Tikkie →
                </a>
              )}

              <button onClick={() => setShowExitQr(v => !v)}
                className="w-full py-4 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium bg-white active:bg-gray-50 transition-colors">
                {showExitQr ? 'Hide exit QR' : 'Show exit QR (cash / PIN at counter)'}
              </button>

              {showExitQr && exitQrUrl && (
                <div className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <p className="text-sm text-gray-500 text-center">Show this QR to staff after paying at the counter</p>
                  <div className="p-3 bg-white rounded-xl border border-gray-100">
                    <QRCode value={exitQrUrl} size={160} />
                  </div>
                  <p className="text-xs text-gray-400">Scanning this frees your table automatically</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky pay button */}
        {!isPending && allItems.length > 0 && (
          <div className="fixed bottom-[80px] left-0 right-0 px-3 pb-2 z-30 pointer-events-none">
            <div className="max-w-lg mx-auto pointer-events-auto">
              <button
                onClick={handlePayRequest}
                disabled={isPaying}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg"
                style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
              >
                {isPaying ? 'Requesting…' : '💸 Request to Pay'}
              </button>
            </div>
          </div>
        )}

        <BottomNavBar />

        <footer className="px-4 py-3 border-t border-gray-100 bg-white text-center">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Order data is processed solely to manage your visit. Session data removed after your visit.
            Records kept 30 days for accounting. · <span className="underline">privacy@lastapas.nl</span>
          </p>
        </footer>
      </main>
    </AuthGuard>
  );
}
