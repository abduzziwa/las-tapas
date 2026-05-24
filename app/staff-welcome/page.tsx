'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_ROUTES: Record<string, string> = {
  waiter:  '/waiter',
  bar:     '/bar',
  chef:    '/chef',
  manager: '/Admin',
  admin:   '/Admin',
  cashier: '/Admin',
};

const ROLE_INFO: Record<string, { label: string; desc: string; gradient: string }> = {
  waiter:  { label: 'Waiter',    desc: 'Take and manage table orders, serve guests.',          gradient: 'from-blue-500 to-blue-700'   },
  bar:     { label: 'Bar Staff', desc: 'Prepare and complete drink orders from the bar.',      gradient: 'from-purple-500 to-purple-700' },
  chef:    { label: 'Chef',      desc: 'Manage kitchen queue and mark dishes as ready.',       gradient: 'from-orange-500 to-orange-700' },
  manager: { label: 'Manager',   desc: 'Full access — orders, staff, menu, and settings.',    gradient: 'from-green-500 to-green-700'  },
  admin:   { label: 'Manager',   desc: 'Full access — orders, staff, menu, and settings.',    gradient: 'from-green-500 to-green-700'  },
  cashier: { label: 'Manager',   desc: 'Full access — orders, staff, menu, and settings.',    gradient: 'from-green-500 to-green-700'  },
};

interface AssignmentData {
  employeeId:   string;
  name:         string;
  baseRole:     string;
  assignedRole: string | null;
  date:         string;
}

export default function StaffWelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState<AssignmentData | null>(null);

  useEffect(() => {
    fetch('/api/auth/assignment')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((d: AssignmentData) => {
        setData(d);
        // Store effective working role for this session
        const role = d.assignedRole ?? d.baseRole;
        sessionStorage.setItem('employeeId',   d.employeeId);
        sessionStorage.setItem('employeeName', d.name);
        sessionStorage.setItem('employeeRole', role);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleStart = () => {
    if (!data) return;
    const role = data.assignedRole ?? data.baseRole;
    router.replace(ROLE_ROUTES[role] ?? '/waiter');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!data) return null;

  const activeRole = data.assignedRole ?? data.baseRole;
  const info       = ROLE_INFO[activeRole] ?? { label: activeRole, desc: '', gradient: 'from-gray-500 to-gray-700' };
  const isOverride = !!data.assignedRole && data.assignedRole !== data.baseRole;

  const dateLabel = new Date(data.date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
          >
            L
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-widest">{dateLabel}</p>
        </div>

        {/* Welcome card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-7 shadow-2xl space-y-5">
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h1 className="text-white text-2xl font-bold mt-0.5">{data.name}</h1>
          </div>

          {/* Role assignment card */}
          <div className="rounded-xl overflow-hidden border border-gray-700">
            <div className={`bg-gradient-to-r ${info.gradient} px-4 py-3`}>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
                {isOverride ? 'Assigned role for today' : 'Your role today'}
              </p>
              <p className="text-white text-xl font-bold mt-0.5">{info.label}</p>
            </div>
            <div className="bg-gray-800/60 px-4 py-3">
              <p className="text-gray-400 text-sm">{info.desc}</p>
              {isOverride && (
                <p className="text-gray-500 text-xs mt-1.5">
                  Base role: <span className="capitalize">{data.baseRole}</span> — assigned by your manager
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
          >
            Start my shift
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-5">
          Wrong role? Ask your manager to update the schedule.
        </p>
      </div>
    </main>
  );
}
