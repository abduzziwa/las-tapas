'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ROLE_ROUTES: Record<string, string> = {
  waiter:  '/waiter',
  bar:     '/bar',
  chef:    '/chef',
  admin:   '/Admin',
  manager: '/Admin',
  cashier: '/Admin',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '';

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    // If already logged in, go to the welcome screen (or redirect if middleware sent us here)
    const id   = sessionStorage.getItem('employeeId');
    const role = sessionStorage.getItem('employeeRole');
    if (id && role) {
      router.replace(redirect || '/staff-welcome');
      return;
    }
    // If no employees exist yet, redirect to first-time setup
    fetch('/api/auth/setup')
      .then((r) => r.json())
      .then((d) => { if (d.needsSetup) router.replace('/setup'); })
      .catch(() => {});
  }, [redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid credentials');
        return;
      }

      // Store base session — staff-welcome will update role to assigned role
      sessionStorage.setItem('employeeId',   data.employeeId);
      sessionStorage.setItem('employeeName', data.name);
      sessionStorage.setItem('employeeRole', data.role);

      // If middleware sent us here with a specific redirect, honour it.
      // Otherwise always go to the welcome screen so staff see their assignment.
      const dest = redirect || '/staff-welcome';
      router.replace(dest);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
          >
            L
          </div>
          <h1 className="text-white text-2xl font-bold">Las Tapas</h1>
          <p className="text-gray-400 text-sm mt-1">Staff Portal</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-7 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-5">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Employee ID or Email</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP001 or email@example.com"
                required
                autoComplete="username"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Guest hint */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Are you a guest?{' '}
          <span className="text-gray-400">Please scan the QR code at your table to order.</span>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
