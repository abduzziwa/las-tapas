"use client";
import React, { useState, useEffect, useCallback } from "react";

interface PaymentConfig {
  tikkieApiKeySet: boolean;
  tikkieAppTokenSet: boolean;
  iban: string;
  accountHolder: string;
  enabledMethods: string[];
  updatedAt: string | null;
  updatedBy: string;
}

interface PaymentOrder {
  orderId: number;
  sessionId: string;
  tableNumber: string;
  seatNumber: string;
  guestName: string;
  itemCount: number;
  total: number;
  payment: string;
  paymentMethod: string;
  orderedAt: string | null;
}

interface OverviewSummary {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  grandTotal: number;
  paidTotal: number;
}

const METHOD_LABELS: Record<string, string> = {
  pin: 'PIN',
  cash: 'Cash',
  tikkie: 'Tikkie',
};

const ALL_METHODS = ['pin', 'cash', 'tikkie'];

export default function Payments() {
  const [activeTab, setActiveTab] = useState<'setup' | 'overview'>('overview');

  // Setup state
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [appToken, setAppToken] = useState('');
  const [iban, setIban] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [enabledMethods, setEnabledMethods] = useState<string[]>(['pin', 'cash']);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Overview state
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/payments/config`);
      const data: PaymentConfig = await res.json();
      setConfig(data);
      setIban(data.iban);
      setAccountHolder(data.accountHolder);
      setEnabledMethods(data.enabledMethods);
    } catch {
      // silent
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/payments/overview`);
      const data = await res.json();
      setOrders(data.orders || []);
      setSummary(data.summary || null);
    } catch {
      // silent
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchOverview();
    const id = setInterval(fetchOverview, 15000);
    return () => clearInterval(id);
  }, [fetchConfig, fetchOverview]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const body: Record<string, unknown> = {
        iban,
        accountHolder,
        enabledMethods,
        updatedBy: 'admin',
      };
      if (apiKey) body.tikkieApiKey = apiKey;
      if (appToken) body.tikkieAppToken = appToken;

      const res = await fetch(`/api/admin/payments/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSaveMsg('Saved successfully');
        setApiKey('');
        setAppToken('');
        await fetchConfig();
      } else {
        setSaveMsg('Save failed');
      }
    } catch {
      setSaveMsg('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const toggleMethod = (method: string) => {
    setEnabledMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Payments</h2>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {(['overview', 'setup'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div>
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total revenue', value: `€${summary.grandTotal.toFixed(2)}`, accent: true },
                { label: 'Paid', value: `€${summary.paidTotal.toFixed(2)}` },
                { label: 'Pending', value: summary.pendingOrders },
                { label: 'Orders', value: summary.totalOrders },
              ].map(({ label, value, accent }) => (
                <div key={label} className={`rounded-xl p-3 ${accent ? 'bg-gradient-to-br from-[#F95E07] to-[#DB8555] text-white' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium ${accent ? 'text-orange-100' : 'text-gray-500'}`}>{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {loadingOverview ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No payment activity yet</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    {['Order', 'Table', 'Guest', 'Items', 'Total', 'Method', 'Status', 'Time'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-gray-700">#{o.orderId}</td>
                      <td className="px-3 py-2.5 font-medium">{o.tableNumber}</td>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[100px] truncate">
                        {o.guestName || <span className="text-gray-400 italic">Anon</span>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{o.itemCount}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-900">€{o.total.toFixed(2)}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                          {METHOD_LABELS[o.paymentMethod] || o.paymentMethod || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          o.payment === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {o.payment === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-400 text-xs tabular-nums">
                        {o.orderedAt
                          ? new Date(o.orderedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Setup tab ── */}
      {activeTab === 'setup' && (
        <div className="space-y-6 max-w-lg">
          {/* Tikkie credentials */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tikkie (ABN AMRO)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  API Key {config?.tikkieApiKeySet && <span className="text-green-600 ml-1">✓ configured</span>}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={config?.tikkieApiKeySet ? 'Leave blank to keep existing' : 'Enter API key'}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  App Token {config?.tikkieAppTokenSet && <span className="text-green-600 ml-1">✓ configured</span>}
                </label>
                <input
                  type="password"
                  value={appToken}
                  onChange={(e) => setAppToken(e.target.value)}
                  placeholder={config?.tikkieAppTokenSet ? 'Leave blank to keep existing' : 'Enter app token'}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </section>

          {/* Bank details */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Bank details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">IBAN</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="NL91ABNA0417164300"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Account holder</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Las Tapas Restaurant"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </section>

          {/* Enabled payment methods */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Enabled payment methods</h3>
            <div className="flex gap-3 flex-wrap">
              {ALL_METHODS.map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledMethods.includes(m)}
                    onChange={() => toggleMethod(m)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-sm text-gray-700">{METHOD_LABELS[m]}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#F95E07] to-[#DB8555] text-white text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMsg}
              </span>
            )}
          </div>

          {config?.updatedAt && (
            <p className="text-xs text-gray-400">
              Last updated {new Date(config.updatedAt).toLocaleString('nl-NL')} by {config.updatedBy}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
