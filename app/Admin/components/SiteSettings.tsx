'use client';
import { useState, useEffect, useCallback } from 'react';

type Template = 'luxury-dark' | 'warm-bistro' | 'clean-modern';

interface Settings {
  heroImageUrl:   string;
  logoText:       string;
  tagline:        string;
  welcomeTitle:   string;
  welcomeText:    string;
  highlights:     string[];
  qrInstructions: string;
  accentColor:    string;
  address:        string;
  phone:          string;
  openingHours:   string;
  template:       Template;
}

const DEFAULT: Settings = {
  heroImageUrl:   '',
  logoText:       'Las Tapas',
  tagline:        'Authentic Spanish Tapas',
  welcomeTitle:   'Welcome to Las Tapas',
  welcomeText:    '',
  highlights:     ['', '', ''],
  qrInstructions: '',
  accentColor:    '#F95E07',
  address:        '',
  phone:          '',
  openingHours:   '',
  template:       'luxury-dark',
};

const TEMPLATES: { id: Template; name: string; desc: string; bg: string; text: string; accent: string }[] = [
  {
    id:     'luxury-dark',
    name:   'Luxury Dark',
    desc:   'Moody, sophisticated. Dark tones with warm amber glow.',
    bg:     'linear-gradient(135deg,#1a0800,#3d1500)',
    text:   '#f5e6d0',
    accent: '#F95E07',
  },
  {
    id:     'warm-bistro',
    name:   'Warm Bistro',
    desc:   'Inviting, casual European feel. Cream and terracotta.',
    bg:     'linear-gradient(135deg,#fdf6ec,#fbe9d5)',
    text:   '#4a2c0a',
    accent: '#c8430a',
  },
  {
    id:     'clean-modern',
    name:   'Clean Modern',
    desc:   'Minimal, bright, and contemporary. White with crisp orange.',
    bg:     'linear-gradient(135deg,#ffffff,#f8f8f8)',
    text:   '#111111',
    accent: '#F95E07',
  },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
const TEXTAREA = `${INPUT} resize-none`;

export default function SiteSettingsPanel() {
  const [form, setForm]       = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setForm({
        heroImageUrl:   data.heroImageUrl   ?? '',
        logoText:       data.logoText       ?? DEFAULT.logoText,
        tagline:        data.tagline        ?? DEFAULT.tagline,
        welcomeTitle:   data.welcomeTitle   ?? DEFAULT.welcomeTitle,
        welcomeText:    data.welcomeText    ?? '',
        highlights:     data.highlights?.length ? data.highlights : ['', '', ''],
        qrInstructions: data.qrInstructions ?? '',
        accentColor:    data.accentColor    ?? DEFAULT.accentColor,
        address:        data.address        ?? '',
        phone:          data.phone          ?? '',
        openingHours:   data.openingHours   ?? '',
        template:       (data.template as Template) ?? DEFAULT.template,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof Settings, val: string) => setForm(f => ({ ...f, [key]: val }));
  const setHighlight = (i: number, val: string) =>
    setForm(f => { const h = [...f.highlights]; h[i] = val; return { ...f, highlights: h }; });
  const addHighlight    = () => setForm(f => ({ ...f, highlights: [...f.highlights, ''] }));
  const removeHighlight = (i: number) =>
    setForm(f => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, highlights: form.highlights.filter(Boolean) }),
      });
      setMsg(res.ok ? 'Published successfully' : 'Save failed');
    } catch { setMsg('Save failed'); }
    finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Home Page Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Customise your guest-facing home page. Click <strong>Publish</strong> to make changes live.
        </p>
      </div>

      {/* ── Template Picker ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Choose a template</h3>
        <p className="text-xs text-gray-400">Only one template is shown at a time. Your content works with any template.</p>

        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => {
            const active = form.template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setForm(f => ({ ...f, template: t.id }))}
                className={`relative rounded-xl overflow-hidden border-2 transition-all text-left focus:outline-none ${
                  active ? 'border-orange-500 shadow-md ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Mini preview */}
                <div className="h-20 w-full relative" style={{ background: t.bg }}>
                  {/* Fake hero content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 p-2">
                    <div className="h-2 rounded-full w-16" style={{ background: t.text + '90' }} />
                    <div className="h-1.5 rounded-full w-10 mt-0.5" style={{ background: t.text + '50' }} />
                    <div className="h-5 rounded-full w-14 mt-2 flex items-center justify-center" style={{ background: t.accent }}>
                      <div className="h-1 rounded-full w-8 bg-white/70" />
                    </div>
                  </div>
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Label */}
                <div className="px-2.5 py-2 bg-white">
                  <p className={`text-xs font-semibold ${active ? 'text-orange-600' : 'text-gray-700'}`}>{t.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Hero ── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Hero section</h3>

        <Field label="Background image URL" hint="Leave blank for the default template background.">
          <input className={INPUT} value={form.heroImageUrl} onChange={e => set('heroImageUrl', e.target.value)} placeholder="https://…" />
        </Field>

        {form.heroImageUrl && (
          <div className="rounded-xl overflow-hidden h-32 bg-gray-100">
            <img src={form.heroImageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Restaurant name">
            <input className={INPUT} value={form.logoText} onChange={e => set('logoText', e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className={INPUT} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Authentic Spanish Tapas" />
          </Field>
        </div>

        <Field label="Accent colour">
          <div className="flex items-center gap-3">
            <input type="color" value={form.accentColor} onChange={e => set('accentColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
            <input className={INPUT} value={form.accentColor} onChange={e => set('accentColor', e.target.value)} style={{ maxWidth: 130 }} />
          </div>
        </Field>
      </section>

      {/* ── Welcome ── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Welcome section</h3>

        <Field label="Headline">
          <input className={INPUT} value={form.welcomeTitle} onChange={e => set('welcomeTitle', e.target.value)} placeholder="Welcome to Las Tapas" />
        </Field>

        <Field label="Description paragraph">
          <textarea className={TEXTAREA} rows={4} value={form.welcomeText} onChange={e => set('welcomeText', e.target.value)}
            placeholder="Tell your guests about the restaurant…" />
        </Field>
      </section>

      {/* ── Highlights ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Highlights</h3>
        <p className="text-xs text-gray-400">Short bullet points shown as feature cards on the home page.</p>
        {form.highlights.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input className={INPUT} value={h} onChange={e => setHighlight(i, e.target.value)}
              placeholder={`Highlight ${i + 1}`} />
            <button onClick={() => removeHighlight(i)}
              className="text-red-400 hover:text-red-600 px-2 text-sm flex-shrink-0">✕</button>
          </div>
        ))}
        <button onClick={addHighlight} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
          + Add highlight
        </button>
      </section>

      {/* ── QR Instructions ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Order instructions</h3>
        <Field label="QR code instruction text">
          <textarea className={TEXTAREA} rows={2} value={form.qrInstructions} onChange={e => set('qrInstructions', e.target.value)}
            placeholder="Scan the QR code at your table to browse the menu and order." />
        </Field>
      </section>

      {/* ── Contact ── */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact & info</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Address">
            <input className={INPUT} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Carrer de…" />
          </Field>
          <Field label="Phone">
            <input className={INPUT} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 …" />
          </Field>
        </div>
        <Field label="Opening hours">
          <input className={INPUT} value={form.openingHours} onChange={e => set('openingHours', e.target.value)} placeholder="Mon–Sun 12:00–23:00" />
        </Field>
      </section>

      {/* ── Publish ── */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
        >
          {saving ? 'Publishing…' : 'Publish changes'}
        </button>
        {msg && (
          <span className={`text-sm font-medium ${msg.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}
