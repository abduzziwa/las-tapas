"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface AuditEntry {
  _id: string;
  eventId: string;
  timestamp: string;
  eventType: string;
  orderId?: string;
  tableNumber?: string;
  sessionId?: string;
  actor?: { type: string; id: string; name?: string };
  details?: {
    from?: string;
    to?: string;
    amount?: number;
    paymentMethod?: string;
    note?: string;
    itemCount?: number;
    items?: string[];
  };
}

const EVENT_CONFIG: Record<string, { label: string; dot: string; icon: string; verb: string }> = {
  'order.created':           { label: 'Order created',    dot: 'bg-green-500',   icon: '🛒', verb: 'Created'   },
  'order.status.preparing':  { label: 'Preparing',        dot: 'bg-amber-500',   icon: '👨‍🍳', verb: 'Preparing' },
  'order.status.ready':      { label: 'Ready',            dot: 'bg-blue-500',    icon: '🔔', verb: 'Ready'     },
  'order.status.served':     { label: 'Served',           dot: 'bg-violet-500',  icon: '✓',  verb: 'Served'   },
  'order.payment.requested': { label: 'Wants to pay',     dot: 'bg-red-500',     icon: '💰', verb: 'Pay req.'  },
  'order.payment.paid':      { label: 'Paid',             dot: 'bg-green-500',   icon: '✅', verb: 'Paid'      },
  'table.occupied':          { label: 'Table occupied',   dot: 'bg-orange-500',  icon: '🪑', verb: 'Occupied'  },
  'table.freed':             { label: 'Table freed',      dot: 'bg-gray-400',    icon: '🆓', verb: 'Freed'     },
  'session.started':         { label: 'Guest arrived',    dot: 'bg-cyan-500',    icon: '📱', verb: 'Arrived'   },
  'session.checkout':        { label: 'Guest departed',   dot: 'bg-gray-400',    icon: '👋', verb: 'Departed'  },
  'employee.clockin':        { label: 'Clocked in',       dot: 'bg-green-500',   icon: '⏰', verb: 'Clock-in'  },
  'employee.clockout':       { label: 'Clocked out',      dot: 'bg-gray-400',    icon: '⏰', verb: 'Clock-out' },
  'payment.config.updated':  { label: 'Config updated',   dot: 'bg-violet-500',  icon: '⚙️', verb: 'Updated'   },
};

function actorLabel(entry: AuditEntry): string {
  if (!entry.actor) return '';
  if (entry.actor.name) return entry.actor.name;
  if (entry.actor.id === 'system' || entry.actor.id === 'door-scan') return entry.actor.id;
  // customer / session id — show type only
  if (entry.actor.type === 'customer') return 'Guest';
  return entry.actor.id.slice(0, 8);
}

// Build the main human-readable headline: "Served → Order #0012 · T2 · by Anna"
function headline(entry: AuditEntry): string {
  const cfg = EVENT_CONFIG[entry.eventType];
  const verb = cfg?.verb ?? entry.eventType;
  const parts: string[] = [verb];

  if (entry.orderId) parts[0] = `${verb} → Order #${entry.orderId}`;
  if (entry.tableNumber) parts.push(entry.tableNumber);

  const by = actorLabel(entry);
  if (by) parts.push(`by ${by}`);

  return parts.join(' · ');
}

// Optional secondary line (items list, payment method, etc.)
function subline(entry: AuditEntry): string | null {
  const d = entry.details;
  if (!d) return null;
  const sub: string[] = [];
  if (d.paymentMethod) sub.push(d.paymentMethod.toUpperCase());
  if (d.amount) sub.push(`€${d.amount.toFixed(2)}`);
  if (d.items && d.items.length > 0) sub.push(d.items.join(', '));
  if (d.note) sub.push(d.note);
  return sub.length > 0 ? sub.join(' · ') : null;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

export default function LiveFeed() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const prevDataRef = useRef<string>('');

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/auditlog?limit=200`);
      const data = await res.json();
      const json = JSON.stringify(data);
      if (json !== prevDataRef.current) {
        prevDataRef.current = json;
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    const id = setInterval(fetchEntries, 3000);
    return () => clearInterval(id);
  }, [fetchEntries]);

  const filtered = filter
    ? entries.filter(
        (e) =>
          e.eventType.includes(filter) ||
          e.tableNumber?.toLowerCase().includes(filter.toLowerCase()) ||
          e.orderId?.includes(filter) ||
          e.actor?.name?.toLowerCase().includes(filter.toLowerCase()) ||
          e.actor?.id?.toLowerCase().includes(filter.toLowerCase())
      )
    : entries;

  let lastDateLabel = '';

  return (
    <div className="p-2 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Live Feed</h2>
          <p className="text-xs text-gray-400 mt-0.5">Auto-refreshes every 3 s</p>
        </div>
        <input
          type="text"
          placeholder="Search by table, order, name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-56"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No events yet</div>
      )}

      <div className="relative">
        {filtered.length > 0 && (
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
        )}

        <ul className="space-y-0">
          {filtered.map((entry) => {
            const cfg = EVENT_CONFIG[entry.eventType] ?? { label: entry.eventType, dot: 'bg-gray-400', icon: '•', verb: entry.eventType };
            const dateLabel = formatDate(entry.timestamp);
            const showDateSep = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;
            const sub = subline(entry);

            return (
              <React.Fragment key={entry.eventId || entry._id}>
                {showDateSep && (
                  <li className="flex items-center gap-3 py-2 pl-6">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{dateLabel}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </li>
                )}
                <li className="flex items-start gap-3 py-1.5 group">
                  {/* Timeline dot */}
                  <div className={`mt-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-1 ring-gray-200 flex-shrink-0 ${cfg.dot} relative z-10`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-mono tabular-nums flex-shrink-0">
                        {formatTime(entry.timestamp)}
                      </span>
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    {/* Main headline: "Served → Order #0012 · T2 · by Anna" */}
                    <p className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">
                      {headline(entry)}
                    </p>
                    {/* Optional sub-line: items list, payment method, etc. */}
                    {sub && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
                    )}
                  </div>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
