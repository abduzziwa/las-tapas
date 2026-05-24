'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  welcomeText:    'Experience the finest tapas in an intimate, vibrant atmosphere. Every dish is crafted with passion and the freshest ingredients.',
  highlights:     ['Authentic Spanish cuisine', 'Award-winning wine selection', 'Warm, intimate atmosphere'],
  qrInstructions: 'Scan the QR code at your table with your phone camera to browse our menu and place your order.',
  accentColor:    '#F95E07',
  address:        '',
  phone:          '',
  openingHours:   '',
  template:       'luxury-dark',
};

// ─────────────────────────────────────────────
// Shared sub-sections used by all templates
// ─────────────────────────────────────────────

function HighlightCards({ highlights, accent, cardBg, textColor }: {
  highlights: string[]; accent: string; cardBg: string; textColor: string;
}) {
  const items = highlights.filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((h, i) => (
        <div key={i} className="rounded-2xl p-5 text-center" style={{ background: cardBg }}>
          <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-base font-bold"
            style={{ background: accent + '22', color: accent }}>✦</div>
          <p className="text-sm font-medium leading-snug" style={{ color: textColor }}>{h}</p>
        </div>
      ))}
    </div>
  );
}

function ContactFooter({ address, phone, openingHours, logoText, dividerColor, textMuted, textStrong }: {
  address: string; phone: string; openingHours: string; logoText: string;
  dividerColor: string; textMuted: string; textStrong: string;
}) {
  if (!address && !phone && !openingHours) return null;
  return (
    <footer className="py-12 px-6" style={{ borderTop: `1px solid ${dividerColor}` }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-3 text-center mb-8">
        {address && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: textMuted }}>Address</p>
            <p className="text-sm leading-relaxed" style={{ color: textStrong }}>{address}</p>
          </div>
        )}
        {phone && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: textMuted }}>Reservations</p>
            <p className="text-sm" style={{ color: textStrong }}>{phone}</p>
          </div>
        )}
        {openingHours && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: textMuted }}>Opening Hours</p>
            <p className="text-sm leading-relaxed" style={{ color: textStrong }}>{openingHours}</p>
          </div>
        )}
      </div>
      <p className="text-center text-xs" style={{ color: textMuted }}>
        © {new Date().getFullYear()} {logoText} · All rights reserved
      </p>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Template A: Luxury Dark
// ─────────────────────────────────────────────
function LuxuryDark({ s, hasSession, onMenu }: { s: Settings; hasSession: boolean; onMenu: () => void }) {
  const a = s.accentColor;
  return (
    <main className="min-h-screen bg-stone-950 text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-5">
        {s.heroImageUrl ? (
          <>
            <div className="absolute inset-0 bg-black/58 z-10" />
            <img src={s.heroImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </>
        ) : (
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 55% 45%, #3d1500 0%, #0d0400 65%)',
          }} />
        )}
        <div className="absolute inset-0 opacity-10 z-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 50%, ${a}, transparent 70%)` }} />

        <div className="relative z-20 text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-8" style={{ background: a + '70' }} />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase px-3 py-1 rounded-full"
              style={{ color: a, background: a + '15', border: `1px solid ${a}35` }}>Fine Dining</span>
            <div className="h-px w-8" style={{ background: a + '70' }} />
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.92] mb-4">{s.logoText}</h1>
          <p className="text-base sm:text-lg text-stone-300 font-light tracking-[0.2em] uppercase mb-10">{s.tagline}</p>
          {hasSession ? (
            <button onClick={onMenu}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-base tracking-wide transition-all duration-200 active:scale-95 hover:opacity-90"
              style={{ background: `linear-gradient(135deg,${a},#c05a10)`, boxShadow: `0 8px 32px ${a}45` }}>
              View Menu <span>→</span>
            </button>
          ) : (
            <p className="text-stone-500 text-xs tracking-widest uppercase">Scan the QR code at your table to begin</p>
          )}
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[9px] tracking-widest uppercase text-stone-400">Discover</span>
          <div className="w-5 h-8 rounded-full border border-stone-600 flex items-start justify-center pt-1.5">
            <div className="w-0.5 h-2 rounded-full bg-stone-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Welcome */}
      {(s.welcomeTitle || s.welcomeText) && (
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 max-w-12" style={{ background: `linear-gradient(to right,transparent,${a}50)` }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: a }} />
              <div className="h-px flex-1 max-w-12" style={{ background: `linear-gradient(to left,transparent,${a}50)` }} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">{s.welcomeTitle}</h2>
            {s.welcomeText && <p className="text-stone-400 text-base sm:text-lg leading-relaxed font-light">{s.welcomeText}</p>}
          </div>
        </section>
      )}

      {/* Highlights */}
      {s.highlights.filter(Boolean).length > 0 && (
        <section className="py-12 px-6 bg-stone-900/50">
          <div className="max-w-3xl mx-auto">
            <HighlightCards highlights={s.highlights} accent={a} cardBg="#1c1410" textColor="#e5d5c5" />
          </div>
        </section>
      )}

      {/* QR Instructions */}
      {s.qrInstructions && (
        <section className="py-20 px-6">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl"
              style={{ background: a + '18', border: `1px solid ${a}30`, color: a }}>▣</div>
            <h3 className="text-xl font-bold mb-3">How to Order</h3>
            <p className="text-stone-400 leading-relaxed text-sm">{s.qrInstructions}</p>
            {hasSession && (
              <button onClick={onMenu}
                className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: a + '18', color: a, border: `1px solid ${a}35` }}>
                Open Menu →
              </button>
            )}
          </div>
        </section>
      )}

      <ContactFooter address={s.address} phone={s.phone} openingHours={s.openingHours}
        logoText={s.logoText} dividerColor="#292520" textMuted="#6b5e52" textStrong="#d6c4b0" />
    </main>
  );
}

// ─────────────────────────────────────────────
// Template B: Warm Bistro
// ─────────────────────────────────────────────
function WarmBistro({ s, hasSession, onMenu }: { s: Settings; hasSession: boolean; onMenu: () => void }) {
  const a = s.accentColor;
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: '#fdf6ec', color: '#3d1f0a' }}>
      {/* Hero */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-5">
        {s.heroImageUrl ? (
          <>
            <div className="absolute inset-0 z-10" style={{ background: 'rgba(253,240,220,0.65)' }} />
            <img src={s.heroImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </>
        ) : (
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 40% 60%, #f4c07a55 0%, #fdf6ec 70%), linear-gradient(160deg,#fff8f0,#fde8c8)',
          }} />
        )}

        <div className="relative z-20 text-center max-w-lg mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: a }}>
            ✦ Authentic Experience ✦
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.92] mb-4"
            style={{ color: '#3d1f0a' }}>{s.logoText}</h1>
          <p className="text-base sm:text-lg font-light mb-10 tracking-wide" style={{ color: '#8b5e3c' }}>{s.tagline}</p>

          {hasSession ? (
            <button onClick={onMenu}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
              style={{ background: `linear-gradient(135deg,${a},#c05a10)` }}>
              View Our Menu <span>→</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              style={{ background: a + '15', color: a, border: `1px solid ${a}30` }}>
              <span>Scan QR at your table to order</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom,transparent,#fdf6ec)' }} />
      </section>

      {/* Welcome */}
      {(s.welcomeTitle || s.welcomeText) && (
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-block h-1 w-12 rounded-full mb-6" style={{ background: a }} />
              <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight" style={{ color: '#3d1f0a' }}>
                {s.welcomeTitle}
              </h2>
              {s.welcomeText && (
                <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: '#8b5e3c' }}>
                  {s.welcomeText}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Highlights */}
      {s.highlights.filter(Boolean).length > 0 && (
        <section className="py-12 px-6" style={{ background: '#fff8f2' }}>
          <div className="max-w-3xl mx-auto">
            <HighlightCards highlights={s.highlights} accent={a} cardBg="#fdf0e0" textColor="#5a3015" />
          </div>
        </section>
      )}

      {/* QR Instructions */}
      {s.qrInstructions && (
        <section className="py-16 px-6">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
              style={{ background: a + '15', color: a }}>▣</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#3d1f0a' }}>How to Order</h3>
            <p className="leading-relaxed text-sm" style={{ color: '#8b5e3c' }}>{s.qrInstructions}</p>
            {hasSession && (
              <button onClick={onMenu}
                className="mt-6 px-6 py-3 rounded-full text-white text-sm font-semibold"
                style={{ background: `linear-gradient(135deg,${a},#c05a10)` }}>
                Open Menu →
              </button>
            )}
          </div>
        </section>
      )}

      <ContactFooter address={s.address} phone={s.phone} openingHours={s.openingHours}
        logoText={s.logoText} dividerColor="#f0dcc4" textMuted="#b07a50" textStrong="#5a3015" />
    </main>
  );
}

// ─────────────────────────────────────────────
// Template C: Clean Modern
// ─────────────────────────────────────────────
function CleanModern({ s, hasSession, onMenu }: { s: Settings; hasSession: boolean; onMenu: () => void }) {
  const a = s.accentColor;
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      {/* Hero */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-5">
        {s.heroImageUrl ? (
          <>
            <div className="absolute inset-0 bg-white/50 z-10" />
            <img src={s.heroImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
        )}

        <div className="relative z-20 text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ background: a + '12', color: a, border: `1px solid ${a}25` }}>
            Restaurant
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[0.9] mb-4" style={{ color: '#0a0a0a' }}>
            {s.logoText}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-normal mb-10 tracking-wide">{s.tagline}</p>

          {hasSession ? (
            <button onClick={onMenu}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 active:scale-95 hover:opacity-90"
              style={{ background: a }}>
              View Menu <span>→</span>
            </button>
          ) : (
            <p className="text-gray-400 text-sm">Scan the QR code at your table</p>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right,transparent,${a},transparent)` }} />
      </section>

      {/* Welcome */}
      {(s.welcomeTitle || s.welcomeText) && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block h-1 w-8 rounded-full mb-6" style={{ background: a }} />
            <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight">{s.welcomeTitle}</h2>
            {s.welcomeText && <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">{s.welcomeText}</p>}
          </div>
        </section>
      )}

      {/* Highlights */}
      {s.highlights.filter(Boolean).length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <HighlightCards highlights={s.highlights} accent={a} cardBg="#f5f5f5" textColor="#333333" />
          </div>
        </section>
      )}

      {/* QR Instructions */}
      {s.qrInstructions && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl"
              style={{ background: a + '12', color: a, border: `1px solid ${a}20` }}>▣</div>
            <h3 className="text-xl font-black mb-3">How to Order</h3>
            <p className="text-gray-500 leading-relaxed text-sm">{s.qrInstructions}</p>
            {hasSession && (
              <button onClick={onMenu}
                className="mt-6 px-6 py-3 rounded-xl text-white text-sm font-bold"
                style={{ background: a }}>
                Open Menu →
              </button>
            )}
          </div>
        </section>
      )}

      <ContactFooter address={s.address} phone={s.phone} openingHours={s.openingHours}
        logoText={s.logoText} dividerColor="#e5e5e5" textMuted="#a0a0a0" textStrong="#555555" />
    </main>
  );
}

// ─────────────────────────────────────────────
// Root page — fetch settings, pick template
// ─────────────────────────────────────────────
export default function Home() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const sessionId   = searchParams.get('sessionId');
    const tableNumber = searchParams.get('tableNumber');
    const seatNumber  = searchParams.get('seatNumber');

    if (sessionId && tableNumber) {
      sessionStorage.setItem('sessionId',   sessionId);
      sessionStorage.setItem('tableNumber', tableNumber);
      if (seatNumber) sessionStorage.setItem('seatNumber', seatNumber);
    }

    const sid = sessionStorage.getItem('sessionId');
    const tbl = sessionStorage.getItem('tableNumber');
    if (sid && tbl) setHasSession(true);

    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setSettings({
          heroImageUrl:   data.heroImageUrl   ?? '',
          logoText:       data.logoText       ?? DEFAULT.logoText,
          tagline:        data.tagline        ?? DEFAULT.tagline,
          welcomeTitle:   data.welcomeTitle   ?? DEFAULT.welcomeTitle,
          welcomeText:    data.welcomeText    ?? DEFAULT.welcomeText,
          highlights:     data.highlights?.length ? data.highlights : DEFAULT.highlights,
          qrInstructions: data.qrInstructions ?? DEFAULT.qrInstructions,
          accentColor:    data.accentColor    ?? DEFAULT.accentColor,
          address:        data.address        ?? '',
          phone:          data.phone          ?? '',
          openingHours:   data.openingHours   ?? '',
          template:       (data.template as Template) ?? DEFAULT.template,
        });
      })
      .catch(() => {});
  }, []);

  const goMenu = () => router.push('/menu/foods');

  if (settings.template === 'warm-bistro')  return <WarmBistro  s={settings} hasSession={hasSession} onMenu={goMenu} />;
  if (settings.template === 'clean-modern') return <CleanModern s={settings} hasSession={hasSession} onMenu={goMenu} />;
  return <LuxuryDark s={settings} hasSession={hasSession} onMenu={goMenu} />;
}
