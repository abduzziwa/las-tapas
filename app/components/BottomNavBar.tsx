'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, ClipboardList, ShoppingCart, Receipt } from 'lucide-react';

const LINKS = [
  { href: '/',             label: 'Home',    Icon: Home },
  { href: '/orderHistory', label: 'Orders',  Icon: ClipboardList },
  { href: '/cart',         label: 'Cart',    Icon: ShoppingCart },
  { href: '/bill',         label: 'Bill',    Icon: Receipt },
];

export default function BottomNavBar() {
  const path  = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const stored = localStorage.getItem('CartItems');
        if (!stored) { setCartCount(0); return; }
        const items: { quantity: number }[] = JSON.parse(stored);
        setCartCount(items.reduce((s, i) => s + i.quantity, 0));
      } catch { setCartCount(0); }
    };

    update();
    window.addEventListener('storage', update);
    // Poll every 500 ms so same-tab adds also update the badge
    const id = setInterval(update, 500);
    return () => { window.removeEventListener('storage', update); clearInterval(id); };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[env(safe-area-inset-bottom,8px)] pt-2 pointer-events-none">
      <nav
        className="flex items-center justify-around h-16 rounded-2xl shadow-xl pointer-events-auto"
        style={{ background: 'linear-gradient(90deg,#F95E07 0%,#DB8555 100%)' }}
      >
        {LINKS.map(({ href, label, Icon }) => {
          const active  = path === href;
          const isCart  = href === '/cart';
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 select-none"
            >
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                active ? 'bg-white/25' : ''
              }`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-white/65'}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-red-600 text-[10px] font-bold flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors ${active ? 'text-white' : 'text-white/60'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
