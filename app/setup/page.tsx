'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);

  // If already set up, go straight to login
  useEffect(() => {
    fetch('/api/auth/setup')
      .then((r) => r.json())
      .then((d) => {
        if (!d.needsSetup) router.replace('/login');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Setup failed');
        return;
      }

      setDone(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-white text-xl font-bold mb-2">Admin account created</h1>
          <p className="text-gray-400 text-sm">Redirecting to login…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
          >
            L
          </div>
          <h1 className="text-white text-2xl font-bold">Las Tapas</h1>
          <p className="text-gray-400 text-sm mt-1">First-time setup</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-7 shadow-2xl">
          <div className="mb-5">
            <h2 className="text-white font-semibold text-lg">Create your admin account</h2>
            <p className="text-gray-500 text-xs mt-1">
              This page is only shown once. After setup, only staff with valid credentials can log in.
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {[
              { label: 'Full name',    value: name,       set: setName,       type: 'text',     placeholder: 'e.g. Maria García' },
              { label: 'Employee ID', value: employeeId, set: setEmployeeId, type: 'text',     placeholder: 'e.g. ADMIN001' },
              { label: 'Email',       value: email,      set: setEmail,      type: 'email',    placeholder: 'admin@lastapas.com' },
              { label: 'Password',    value: password,   set: setPassword,   type: 'password', placeholder: '••••••••' },
              { label: 'Confirm password', value: confirm, set: setConfirm,  type: 'password', placeholder: '••••••••' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm mt-1 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Create admin account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
