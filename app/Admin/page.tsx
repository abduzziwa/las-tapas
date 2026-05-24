'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import WaiterAuthGuard from '../waiter/components/WaiterAuthGuard';
import {
  ShoppingBag,
  TableProperties,
  UtensilsCrossed,
  Users,
  CreditCard,
  Activity,
  SlidersHorizontal,
  CalendarDays,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const Orders     = dynamic(() => import('./components/Orders'),      { ssr: false });
const Tables     = dynamic(() => import('./components/Tables'),      { ssr: false });
const MenuItems  = dynamic(() => import('./components/MenuItems'),   { ssr: false });
const Employees  = dynamic(() => import('./components/employees'),   { ssr: false });
const Payments   = dynamic(() => import('./components/Payments'),    { ssr: false });
const LiveFeed   = dynamic(() => import('./components/LiveFeed'),    { ssr: false });
const SiteSettings = dynamic(() => import('./components/SiteSettings'), { ssr: false });
const Schedule     = dynamic(() => import('./components/Schedule'),     { ssr: false });

type Tab = 'Orders' | 'Tables' | 'Menu' | 'Staff' | 'Schedule' | 'Payments' | 'LiveFeed' | 'Settings';

const NAV: { id: Tab; label: string; icon: React.ReactNode; color: string; badge?: string }[] = [
  { id: 'Orders',   label: 'Orders',    icon: <ShoppingBag   className="w-4 h-4" />, color: 'text-blue-500'   },
  { id: 'Tables',   label: 'Tables',    icon: <TableProperties className="w-4 h-4" />, color: 'text-emerald-500' },
  { id: 'Menu',     label: 'Menu',      icon: <UtensilsCrossed className="w-4 h-4" />, color: 'text-orange-500'  },
  { id: 'Staff',    label: 'Staff',     icon: <Users         className="w-4 h-4" />, color: 'text-purple-500'  },
  { id: 'Schedule', label: 'Schedule',  icon: <CalendarDays  className="w-4 h-4" />, color: 'text-indigo-500'  },
  { id: 'Payments', label: 'Payments',  icon: <CreditCard    className="w-4 h-4" />, color: 'text-green-500'   },
  { id: 'LiveFeed', label: 'Live Feed', icon: <Activity      className="w-4 h-4" />, color: 'text-red-500'     },
  { id: 'Settings', label: 'Settings',  icon: <SlidersHorizontal className="w-4 h-4" />, color: 'text-slate-500' },
];

function Sidebar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#F95E07,#c05a10)' }}
          >
            LT
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">Las Tapas</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Manager Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {NAV.map(({ id, label, icon, color }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={isActive ? 'text-orange-500' : color}>{icon}</span>
              <span className="flex-1 text-left">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">Las Tapas © 2025</p>
      </div>
    </aside>
  );
}

function AdminDashboard() {
  const [active, setActive] = useState<Tab>('Orders');
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = NAV.find(n => n.id === active)!;

  const select = (tab: Tab) => {
    setActive(tab);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-col w-56 xl:w-64 bg-white border-r border-gray-200 fixed top-0 left-0 h-screen z-20">
        <Sidebar active={active} onSelect={select} />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-xl flex flex-col z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar active={active} onSelect={select} />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-56 xl:ml-64 flex flex-col min-w-0">

        {/* Top header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 h-14 flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className={`${current.color}`}>{current.icon}</span>
              <h1 className="text-base font-semibold text-gray-900">{current.label}</h1>
            </div>

            {/* Live indicator */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">Live</span>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {active === 'Orders'   && <Orders />}
            {active === 'Tables'   && <Tables />}
            {active === 'Menu'     && <MenuItems />}
            {active === 'Staff'    && <Employees />}
            {active === 'Schedule' && <Schedule />}
            {active === 'Payments' && <Payments />}
            {active === 'LiveFeed' && <LiveFeed />}
            {active === 'Settings' && <SiteSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <WaiterAuthGuard>
      <AdminDashboard />
    </WaiterAuthGuard>
  );
}
