'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface TopNavBarProps {
  showSearch?: boolean;
  title?: string;
}

const TITLES: Record<string, string> = {
  '/menu/foods':    'Food',
  '/menu/drinks':   'Drinks',
  '/menu/desserts': 'Desserts',
  '/cart':          'Your Order',
  '/bill':          'Bill',
  '/orderHistory':  'Order History',
};

const TopNavBar: React.FC<TopNavBarProps> = ({ showSearch = false, title }) => {
  const path     = usePathname();
  const label    = title ?? TITLES[path] ?? 'Las Tapas';
  const isHome   = path === '/';
  const showBack = !isHome;

  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 shadow-sm"
      style={{ background: 'linear-gradient(90deg,#F95E07 0%,#DB8555 100%)' }}
    >
      {/* Left: back or spacer */}
      <div className="w-10 flex-shrink-0">
        {showBack && (
          <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 active:bg-white/30 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
        )}
      </div>

      {/* Center: brand / page title */}
      <div className="flex-1 text-center">
        <span className="text-white font-bold text-base leading-none select-none tracking-wide">
          {label}
        </span>
      </div>

      {/* Right: reserved for future actions */}
      <div className="w-10 flex-shrink-0" />
    </nav>
  );
};

export default TopNavBar;
