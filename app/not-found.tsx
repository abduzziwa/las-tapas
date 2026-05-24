'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ── Floating tapas ingredients ── */
const FLOATERS = [
  { emoji: '🫒', left: '6%',   top: '12%',  size: 28, dur: 6.4, delay: 0.0, rot: 15  },
  { emoji: '🍷', left: '86%',  top: '10%',  size: 36, dur: 7.2, delay: 0.8, rot: -12 },
  { emoji: '🥘', left: '3%',   top: '60%',  size: 32, dur: 5.9, delay: 1.4, rot: 8   },
  { emoji: '🧄', left: '91%',  top: '54%',  size: 24, dur: 8.1, delay: 0.3, rot: -20 },
  { emoji: '🍋', left: '17%',  top: '82%',  size: 26, dur: 6.6, delay: 1.9, rot: 10  },
  { emoji: '🌶️', left: '77%',  top: '76%',  size: 30, dur: 7.5, delay: 0.6, rot: -8  },
  { emoji: '🧅', left: '47%',  top: '5%',   size: 22, dur: 5.6, delay: 2.2, rot: 18  },
  { emoji: '🥂', left: '32%',  top: '88%',  size: 34, dur: 6.9, delay: 1.5, rot: -5  },
  { emoji: '🍅', left: '64%',  top: '16%',  size: 22, dur: 9.2, delay: 0.7, rot: 22  },
  { emoji: '🫙', left: '11%',  top: '36%',  size: 20, dur: 7.9, delay: 1.8, rot: -14 },
  { emoji: '🍢', left: '72%',  top: '42%',  size: 18, dur: 8.5, delay: 2.6, rot: 30  },
  { emoji: '🥖', left: '55%',  top: '91%',  size: 28, dur: 6.1, delay: 0.4, rot: -18 },
];

export default function NotFound() {
  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          50%       { transform: translateY(-18px) rotate(calc(var(--rot) * -0.6)); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(1.08); }
        }
        @keyframes plate-spin {
          0%   { transform: rotate(-4deg) scale(1); }
          50%  { transform: rotate(4deg) scale(1.04); }
          100% { transform: rotate(-4deg) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .four-gradient {
          background: linear-gradient(160deg, #F95E07 0%, #ffb347 45%, #DB8555 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .plate-spin {
          animation: plate-spin 4s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      <main
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #1e0800 0%, #0a0200 70%)' }}
      >
        {/* Ambient glow behind the 404 */}
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '480px', height: '480px',
            transform: 'translate(-50%, -55%)',
            background: 'radial-gradient(circle, #F95E07, transparent 70%)',
            animation: 'glow-pulse 4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Floating ingredients */}
        {FLOATERS.map((f, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: f.left,
              top: f.top,
              fontSize: f.size,
              '--rot': `${f.rot}deg`,
              animation: `floatY ${f.dur}s ease-in-out ${f.delay}s infinite`,
              opacity: 0.55,
              userSelect: 'none',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
            } as React.CSSProperties}
            aria-hidden="true"
          >
            {f.emoji}
          </div>
        ))}

        {/* Main content */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 4 🍽️ 4 */}
          <div
            className="flex items-center justify-center leading-none select-none"
            style={{ gap: '0.08em' }}
          >
            <span
              className="four-gradient font-black"
              style={{
                fontSize: 'clamp(7rem, 22vw, 14rem)',
                lineHeight: 1,
                textShadow: '0 0 80px rgba(249,94,7,0.35)',
                letterSpacing: '-0.04em',
              }}
            >
              4
            </span>

            <span
              className="plate-spin"
              style={{
                fontSize: 'clamp(5.5rem, 17vw, 11rem)',
                filter: 'drop-shadow(0 4px 24px rgba(249,94,7,0.6))',
                lineHeight: 1,
              }}
              aria-label="empty plate"
            >
              🍽️
            </span>

            <span
              className="four-gradient font-black"
              style={{
                fontSize: 'clamp(7rem, 22vw, 14rem)',
                lineHeight: 1,
                textShadow: '0 0 80px rgba(249,94,7,0.35)',
                letterSpacing: '-0.04em',
              }}
            >
              4
            </span>
          </div>

          {/* Divider line */}
          <motion.div
            className="h-px w-48 sm:w-64 my-6"
            style={{ background: 'linear-gradient(to right, transparent, #F95E07, transparent)' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          />

          {/* Spanish headline */}
          <motion.p
            className="text-stone-200 font-bold text-xl sm:text-2xl mb-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            ¡Ay, caramba!
          </motion.p>

          <motion.p
            className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm mb-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.5 }}
          >
            Looks like this dish isn&apos;t on our menu.
            The page you&apos;re looking for has left the kitchen.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.74, duration: 0.5 }}
          >
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-sm w-full sm:w-auto tracking-wide transition-all active:scale-95 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #F95E07, #c05a10)',
                boxShadow: '0 8px 32px rgba(249,94,7,0.35)',
                minWidth: 180,
              }}
            >
              <span>🏠</span>
              Back to Home
            </Link>

            <Link
              href="/menu/foods"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm w-full sm:w-auto tracking-wide transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(249,94,7,0.35)',
                color: '#F95E07',
                minWidth: 180,
              }}
            >
              <span>🍴</span>
              View Menu
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom brand signature */}
        <motion.p
          className="absolute bottom-8 left-0 right-0 text-center text-stone-700 text-xs tracking-[0.2em] uppercase select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          Las Tapas · Authentic Spanish Cuisine
        </motion.p>
      </main>
    </>
  );
}
