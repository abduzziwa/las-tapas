'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, CalendarDays } from 'lucide-react';

const ROLES = ['waiter', 'bar', 'chef', 'manager'] as const;
type Role = (typeof ROLES)[number];

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  waiter:  { label: 'Waiter',    cls: 'bg-blue-100 text-blue-700'    },
  bar:     { label: 'Bar Staff', cls: 'bg-purple-100 text-purple-700' },
  chef:    { label: 'Chef',      cls: 'bg-orange-100 text-orange-700' },
  manager: { label: 'Manager',   cls: 'bg-green-100 text-green-700'  },
};

interface StaffRow {
  employeeId:   string;
  name:         string;
  baseRole:     string;
  assignedRole: string | null;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Schedule() {
  const [date,    setDate]    = useState<string>(today());
  const [staff,   setStaff]   = useState<StaffRow[]>([]);
  const [draft,   setDraft]   = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [saved,   setSaved]   = useState(false);

  const load = useCallback(async (d: string) => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/assignments?date=${d}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setStaff(data.staff);
      // Seed draft from current assignments
      const initial: Record<string, string | null> = {};
      for (const row of data.staff as StaffRow[]) {
        initial[row.employeeId] = row.assignedRole;
      }
      setDraft(initial);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(date); }, [date, load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const assignments = Object.entries(draft).map(([employeeId, assignedRole]) => ({
        employeeId,
        assignedRole,
      }));
      const res = await fetch('/api/admin/assignments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ date, assignments }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Save failed');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      load(date);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const setAssignment = (employeeId: string, role: string | null) => {
    setDraft(prev => ({ ...prev, [employeeId]: role }));
  };

  const isToday = date === today();
  const hasChanges = staff.some(s => draft[s.employeeId] !== s.assignedRole);

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Daily Schedule</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Assign each staff member a working role for a given day.
            They will see their assignment when they log in.
          </p>
        </div>
        <button
          onClick={() => load(date)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>
        {isToday && (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Today
          </span>
        )}
        <span className="text-sm text-gray-500 hidden sm:inline">{formatDate(date)}</span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Staff table */}
      {!loading && staff.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-gray-400">No active staff found.</p>
        </div>
      )}

      {!loading && staff.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Employee', 'Base Role', "Today's Assignment", 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map(row => {
                  const assigned = draft[row.employeeId];
                  const changed  = assigned !== row.assignedRole;
                  const baseInfo = ROLE_BADGE[row.baseRole];

                  return (
                    <tr key={row.employeeId} className={`transition-colors ${changed ? 'bg-orange-50/40' : 'hover:bg-gray-50'}`}>
                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{row.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{row.employeeId}</p>
                      </td>

                      {/* Base role */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${baseInfo?.cls ?? 'bg-gray-100 text-gray-600'}`}>
                          {baseInfo?.label ?? row.baseRole}
                        </span>
                      </td>

                      {/* Assignment dropdown */}
                      <td className="px-4 py-3">
                        <select
                          value={assigned ?? ''}
                          onChange={e => setAssignment(row.employeeId, e.target.value || null)}
                          className={`text-sm border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white ${
                            changed ? 'border-orange-300' : 'border-gray-200'
                          }`}
                        >
                          <option value="">— Use base role —</option>
                          {ROLES.map(r => (
                            <option key={r} value={r}>
                              {ROLE_BADGE[r]?.label ?? r}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {assigned ? (
                          <span className="text-xs text-green-600 font-medium">Assigned</span>
                        ) : (
                          <span className="text-xs text-gray-400">Default</span>
                        )}
                        {changed && (
                          <span className="ml-2 text-xs text-orange-500 font-medium">unsaved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save bar */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
            >
              {saving ? 'Saving…' : 'Save assignments'}
            </button>

            {!hasChanges && !saved && (
              <span className="text-xs text-gray-400">No unsaved changes</span>
            )}

            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Saved — staff will see their role on next login
              </span>
            )}
          </div>

          {/* Info note */}
          <div className="mt-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700">
              <strong>How it works:</strong> When a staff member logs in, they see their assigned role for today on a welcome screen before being taken to their workspace.
              Leaving a row at "— Use base role —" means they work their normal role.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
