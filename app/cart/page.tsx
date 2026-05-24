'use client';
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import ConfirmationModal from '../components/ConfirmationModel';
import AuthGuard from '../components/AuthGuard';

interface CartItem {
  foodId: string;
  name: string;
  quantity: number;
  modification: string;
  price: number;
  category: string;
}

export default function Cart() {
  const [cartItems,   setCartItems]   = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState<string | null>(null);
  const [isModalOpen,  setIsModalOpen]  = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('CartItems');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  const sync = (updated: CartItem[]) => {
    setCartItems(updated);
    if (updated.length > 0) localStorage.setItem('CartItems', JSON.stringify(updated));
    else localStorage.removeItem('CartItems');
  };

  const increase = (foodId: string) =>
    sync(cartItems.map(i => i.foodId === foodId ? { ...i, quantity: i.quantity + 1 } : i));

  const decrease = (foodId: string) =>
    sync(cartItems.map(i => i.foodId === foodId && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0));

  const remove = (foodId: string) => sync(cartItems.filter(i => i.foodId !== foodId));

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const submitOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const sessionId   = sessionStorage.getItem('sessionId');
    const tableNumber = sessionStorage.getItem('tableNumber');
    const guestName   = sessionStorage.getItem('guestName') || '';

    if (!sessionId || !tableNumber) {
      setSubmitError('Session information is missing. Please scan the QR code again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/orders/newOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId, tableNumber, guestName,
          foodItems: cartItems.map(i => ({
            foodId: i.foodId, name: i.name, quantity: i.quantity,
            modification: i.modification || '', price: i.price, category: i.category,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit order');
      }

      sync([]);
      toast.success('Order sent to the kitchen!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit order';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-screen bg-gray-50">
        <TopNavBar />
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => { setIsModalOpen(false); submitOrder(); }} />

        <div className="flex-1 px-3 pt-4 pb-40">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="text-5xl mb-4">🛒</p>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add items from the menu</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-lg mx-auto">
              {cartItems.map((item, idx) => (
                <div key={`${item.foodId}-${idx}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</h3>
                      {item.modification && item.modification !== 'none' && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">Note: {item.modification}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">€{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">€{item.price.toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => decrease(item.foodId)}
                        className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => increase(item.foodId)}
                        className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>

                    <button onClick={() => remove(item.foodId)}
                      className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-xs font-medium active:opacity-70 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky order summary + submit */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-[80px] left-0 right-0 px-3 pb-2 z-30 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-lg mx-auto pointer-events-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                </span>
                <span className="font-bold text-lg text-gray-900">€{total.toFixed(2)}</span>
              </div>
              {submitError && <p className="text-red-500 text-xs mb-2">{submitError}</p>}
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
              >
                {isSubmitting ? 'Sending order…' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        <BottomNavBar />
      </main>
    </AuthGuard>
  );
}
