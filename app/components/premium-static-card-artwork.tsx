import type { ReactNode } from 'react';
import type {
  PremiumStaticArtwork,
  PremiumStaticCard,
} from '@/app/lib/premium-static-pages-content';

type PremiumStaticCardArtworkProps = {
  card: PremiumStaticCard;
  index: number;
};

const defaultArtworks: PremiumStaticArtwork[] = [
  'scan',
  'signals',
  'route',
  'document',
  'donut',
  'priority',
  'shield',
  'message',
  'clock',
  'payment',
  'lock',
  'check',
  'bolt',
  'brand',
  'grid',
];

function resolveArtwork(card: PremiumStaticCard, index: number): PremiumStaticArtwork {
  if (card.artwork) {
    return card.artwork;
  }

  return defaultArtworks[index % defaultArtworks.length];
}

/* ── Clean SF-Symbols-inspired icons ── */

function Icon({
  name,
  className = '',
}: {
  name:
    | 'search'
    | 'route'
    | 'chart-pie'
    | 'file-description'
    | 'credit-card'
    | 'shield-check'
    | 'message'
    | 'clock'
    | 'lock'
    | 'check'
    | 'bolt'
    | 'eye'
    | 'question'
    | 'globe'
    | 'storefront'
    | 'layers';
  className?: string;
}) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  switch (name) {
    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case 'route':
      return (
        <svg {...commonProps}>
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="5" r="2" />
          <path d="M12 19h4a4 4 0 0 0 0-8H8a4 4 0 0 1 0-8h4" />
        </svg>
      );
    case 'chart-pie':
      return (
        <svg {...commonProps}>
          <path d="M21 12A9 9 0 1 1 12 3" />
          <path d="M21 12A9 9 0 0 0 12 3v9h9z" />
        </svg>
      );
    case 'file-description':
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      );
    case 'credit-card':
      return (
        <svg {...commonProps}>
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <path d="M2 10h20" />
          <path d="M6 15h2" />
          <path d="M12 15h2" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg {...commonProps}>
          <path d="M12 2l7 4v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'message':
      return (
        <svg {...commonProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...commonProps}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 1 1 8 0v4" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      );
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...commonProps}>
          <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...commonProps}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'question':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8" />
          <path d="M3.6 15h16.8" />
          <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
        </svg>
      );
    case 'storefront':
      return (
        <svg {...commonProps}>
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-6h6v6" />
          <path d="M10 9h4" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...commonProps}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
  }
}

/* ── Artwork surface ── */

function ArtworkSurface({
  dark,
  tall = false,
  accent,
  children,
  gradient,
  integrated = false,
}: {
  dark: boolean;
  tall?: boolean;
  accent: string;
  children: ReactNode;
  gradient?: string;
  integrated?: boolean;
}) {
  if (integrated) {
    return (
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden ${
          tall ? 'h-[56%] min-h-[12.5rem] sm:min-h-[14rem]' : 'h-[50%] min-h-[11rem] sm:min-h-[12rem]'
        }`}
        aria-hidden
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative mt-8 overflow-hidden rounded-[28px] ${tall ? 'h-52 sm:h-56' : 'h-40 sm:h-44'}`}
      style={{
        backgroundColor: dark ? '#17181A' : '#FFFFFF',
        borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(17,17,17,0.06)',
        ...(gradient ? { background: gradient } : {}),
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(17,17,17,0.04)' }}
      />
      {children}
    </div>
  );
}

/* ── Main component ── */

export default function PremiumStaticCardArtwork({
  card,
  index,
}: PremiumStaticCardArtworkProps) {
  const artwork = resolveArtwork(card, index);
  if (artwork === 'none') {
    return null;
  }

  const isDark = card.tone === 'dark';
  const accent = card.accent ?? (isDark ? '#7ED3FF' : '#111111');
  const line = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(17,17,17,0.5)';
  const soft = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.04)';
  const softFill = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(17,17,17,0.03)';
  const tall = card.size === 'full';
  const integrated = card.artworkIntegrated === true;

  switch (artwork) {
    /* ── Scan: crawl — fenêtre + pages parcourues en chaîne ── */
    case 'scan':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex flex-col justify-center px-8 pb-5 pt-4">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: soft }} />
                ))}
              </div>
              <div
                className="h-7 max-w-[11rem] flex-1 rounded-full"
                style={{ backgroundColor: softFill, border: `1px solid ${soft}` }}
              />
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {[0, 1, 2].map((page) => (
                <div key={page} className="flex items-center gap-1 sm:gap-2">
                  <div
                    className="flex h-[4.25rem] w-[3.25rem] flex-col rounded-xl sm:h-[4.75rem] sm:w-[3.75rem]"
                    style={{
                      border: `1.5px solid ${page === 1 ? accent : soft}`,
                      backgroundColor: page === 1 ? softFill : 'transparent',
                    }}
                  >
                    <div className="m-2 flex flex-1 flex-col justify-center gap-1">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: page === 1 ? '75%' : '55%',
                          backgroundColor: page === 1 ? accent : soft,
                        }}
                      />
                      <div className="h-1 rounded-full" style={{ backgroundColor: soft }} />
                      <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: soft }} />
                    </div>
                  </div>
                  {page < 2 ? (
                    <svg width="14" height="10" viewBox="0 0 14 10" className="shrink-0 opacity-70" aria-hidden>
                      <path
                        d="M1 5h8M9 5l-2.5-2M9 5l-2.5 2"
                        fill="none"
                        stroke={line}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Signals: contenu structuré — titre, paragraphes, étiquettes (ce que le modèle “lit”) ── */
    case 'signals':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-9 inset-y-7 flex flex-col justify-center gap-2.5">
            <div className="h-2.5 max-w-[14rem] rounded-full" style={{ backgroundColor: accent }} />
            <div className="h-1.5 w-full max-w-[17rem] rounded-full" style={{ backgroundColor: soft }} />
            <div className="h-1.5 w-full max-w-[15rem] rounded-full" style={{ backgroundColor: soft }} />
            <div className="mt-1 flex flex-wrap gap-2">
              <div
                className="h-5 rounded-full px-3"
                style={{ backgroundColor: softFill, border: `1px solid ${soft}`, width: '3.25rem' }}
              />
              <div
                className="h-5 rounded-full px-3"
                style={{ backgroundColor: softFill, border: `1px solid ${soft}`, width: '4.5rem' }}
              />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Brand: identité — bloc marque abstrait + accroches texte (pas de logo factice) ── */
    case 'brand':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-7 inset-y-6 flex items-center gap-5 sm:gap-6">
            <div
              className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.35rem] sm:h-20 sm:w-20"
              style={{
                border: `1px solid ${soft}`,
                backgroundColor: softFill,
              }}
            >
              <svg viewBox="0 0 32 32" className="h-11 w-11 opacity-90" fill="none" aria-hidden>
                <path d="M8 10h6v6H8zM18 10h6v6h-6zM8 20h6v6h-6zM18 20h6v6h-6z" stroke={accent} strokeWidth="1.25" />
              </svg>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div
                className="h-2.5 max-w-[10rem] rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(17,17,17,0.45)' }}
              />
              <div className="h-2 max-w-[13rem] rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-2 max-w-[11rem] rounded-full" style={{ backgroundColor: soft }} />
              <div className="flex gap-2 pt-0.5">
                <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: accent, opacity: 0.65 }} />
                <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: soft }} />
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Route: visibilité — requête → extrait de réponse → présence marque ── */
    case 'route':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-2 px-6 pb-4 pt-3 sm:gap-3">
            <div
              className="flex h-14 w-[3.25rem] shrink-0 flex-col justify-center gap-1.5 rounded-2xl px-2.5 py-2"
              style={{ border: `1px solid ${soft}` }}
            >
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-1 w-3/4 rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
            </div>
            <svg width="18" height="12" viewBox="0 0 18 12" className="shrink-0" aria-hidden>
              <path
                d="M1 6h12M13 6l-3-2.5M13 6l-3 2.5"
                fill="none"
                stroke={line}
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="relative flex h-[4.75rem] w-[6.5rem] shrink-0 flex-col justify-between rounded-2xl p-2.5 sm:h-[5.25rem] sm:w-[7.5rem]"
              style={{ border: `2px solid ${accent}` }}
            >
              <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: accent, opacity: 0.85 }} />
              <div className="space-y-1">
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
                <div className="h-1 w-5/6 rounded-full" style={{ backgroundColor: soft }} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                <div className="h-1 w-8 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(17,17,17,0.28)' }} />
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Donut: clean pie chart ── */
    case 'donut':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-8">
            {/* Donut */}
            <svg viewBox="0 0 80 80" className="h-24 w-24">
              <circle cx="40" cy="40" r="30" fill="none" stroke={soft} strokeWidth="8" />
              <circle
                cx="40" cy="40" r="30" fill="none"
                stroke={accent} strokeWidth="8"
                strokeDasharray="132 56"
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </svg>
            {/* Legend */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
                <span className="h-2 w-14 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(17,17,17,0.3)' }} />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: soft }} />
                <span className="h-2 w-10 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(17,17,17,0.15)' }} />
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Document: clean file preview ── */
    case 'document':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-28 w-44 flex-col rounded-2xl p-5"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,17,17,0.03)', border: `1px solid ${soft}` }}
            >
              <div className="h-2 w-16 rounded-full" style={{ backgroundColor: accent }} />
              <div className="mt-3 h-1.5 w-full rounded-full" style={{ backgroundColor: soft }} />
              <div className="mt-2 h-1.5 w-4/5 rounded-full" style={{ backgroundColor: soft }} />
              <div className="mt-2 h-1.5 w-3/5 rounded-full" style={{ backgroundColor: soft }} />
              <div className="mt-auto flex items-center gap-2">
                <Icon name="file-description" className="h-4 w-4" />
                <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: soft }} />
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Priority: plan d’action — rangées type liste numérotée ── */
    case 'priority':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-7 top-1/2 flex -translate-y-1/2 flex-col gap-2.5">
            {[1, 2, 3].map((n, i) => (
              <div key={n} className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: i === 0 ? accent : 'transparent',
                    color: i === 0 ? (isDark ? '#111' : '#FFF') : line,
                    border: i === 0 ? 'none' : `1.5px solid ${soft}`,
                  }}
                >
                  {n}
                </span>
                <div
                  className="flex h-11 flex-1 items-center rounded-2xl px-3"
                  style={{
                    backgroundColor: softFill,
                    border: `1px solid ${soft}`,
                  }}
                >
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: i === 0 ? '72%' : i === 1 ? '58%' : '42%',
                      backgroundColor: i === 0 ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(17,17,17,0.12)') : soft,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Payment: clean credit card ── */
    case 'payment':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative h-24 w-40 rounded-xl p-4"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,17,17,0.03)',
                border: `1px solid ${soft}`,
              }}
            >
              {/* Chip */}
              <div className="h-5 w-7 rounded" style={{ backgroundColor: accent, opacity: 0.8 }} />
              {/* Card number dots */}
              <div className="mt-4 flex items-center gap-2">
                {[0, 1, 2].map((g) => (
                  <div key={g} className="flex gap-1">
                    {[0, 1, 2, 3].map((d) => (
                      <span key={d} className="h-1 w-1 rounded-full" style={{ backgroundColor: line }} />
                    ))}
                  </div>
                ))}
                <span className="text-[10px] font-medium" style={{ color: line }}>4242</span>
              </div>
              {/* Contactless icon */}
              <div className="absolute right-3 top-3" style={{ color: line }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M9.5 14.5a5 5 0 0 1 0-5" />
                  <path d="M13 17a9 9 0 0 0 0-10" />
                  <path d="M6 12a1 1 0 1 0 0 0.01" fill="currentColor" stroke="none" />
                </svg>
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Shield: clean centered shield ── */
    case 'shield':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-[22px]"
              style={{ backgroundColor: softFill, color: accent }}
            >
              <Icon name="shield-check" className="h-10 w-10" />
            </div>
          </div>
          {/* Subtle status dots */}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: soft }} />
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: soft }} />
          </div>
        </ArtworkSurface>
      );

    /* ── Message: réponse IA — question courte + bloc réponse (lecture pleine phrase) ── */
    case 'message':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex flex-col justify-center gap-3 px-9 py-4">
            <div className="flex justify-end">
              <div
                className="max-w-[48%] rounded-2xl rounded-br-md px-3.5 py-2"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,17,17,0.06)' }}
              >
                <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: soft }} />
                <div className="mt-1.5 h-1 w-10 rounded-full" style={{ backgroundColor: soft }} />
              </div>
            </div>
            <div
              className="rounded-3xl px-4 py-3.5"
              style={{
                backgroundColor: softFill,
                border: `1px solid ${soft}`,
              }}
            >
              <div className="mb-2 h-1.5 w-24 rounded-full" style={{ backgroundColor: accent, opacity: 0.85 }} />
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
              <div className="mt-1 h-1 w-[92%] rounded-full" style={{ backgroundColor: soft }} />
              <div className="mt-1 h-1 w-[70%] rounded-full" style={{ backgroundColor: soft }} />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                <div className="h-1 w-16 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(17,17,17,0.28)' }} />
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Clock: clean timepiece ── */
    case 'clock':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="h-24 w-24">
              <circle cx="40" cy="40" r="34" fill="none" stroke={soft} strokeWidth="1.5" />
              {/* Hour marks */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="40" y1="10" x2="40" y2="13"
                  stroke={deg % 90 === 0 ? line : soft}
                  strokeWidth={deg % 90 === 0 ? '1.5' : '1'}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 40 40)`}
                />
              ))}
              {/* Hour hand */}
              <line x1="40" y1="40" x2="40" y2="22" stroke={line} strokeWidth="2" strokeLinecap="round" transform="rotate(30 40 40)" />
              {/* Minute hand */}
              <line x1="40" y1="40" x2="40" y2="16" stroke={accent} strokeWidth="1.5" strokeLinecap="round" transform="rotate(150 40 40)" />
              {/* Center dot */}
              <circle cx="40" cy="40" r="2.5" fill={accent} />
            </svg>
          </div>
        </ArtworkSurface>
      );

    /* ── Lock: clean security ── */
    case 'lock':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: softFill, color: accent }}
              >
                <Icon name="lock" className="h-8 w-8" />
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-5 rounded-full"
                    style={{ backgroundColor: i < 3 ? accent : soft }}
                  />
                ))}
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Check: atouts — liste courte avec validations ── */
    case 'check':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex flex-col justify-center gap-3 px-10 sm:px-14">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: accent, color: isDark ? '#111' : '#FFF' }}
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: row === 0 ? '78%' : row === 1 ? '64%' : '52%',
                    backgroundColor: soft,
                  }}
                />
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Bolt: clean speed/performance ── */
    case 'bolt':
    case 'run-bolt':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {!integrated ? (
                <div
                  className="absolute -inset-3 rounded-full"
                  style={{ backgroundColor: accent, opacity: 0.08 }}
                />
              ) : null}
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: softFill, color: accent }}
              >
                <Icon name="bolt" className="h-8 w-8" />
              </div>
            </div>
          </div>
          {/* Speed lines */}
          <div className="absolute bottom-6 left-8 right-8 flex gap-1.5">
            <div className="h-1 flex-[4] rounded-full" style={{ backgroundColor: accent, opacity: 0.6 }} />
            <div className="h-1 flex-[3] rounded-full" style={{ backgroundColor: accent, opacity: 0.3 }} />
            <div className="h-1 flex-[2] rounded-full" style={{ backgroundColor: accent, opacity: 0.15 }} />
          </div>
        </ArtworkSurface>
      );

    /* ── Grid: clean tiles ── */
    case 'grid':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-6 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl"
                style={{
                  backgroundColor: i === 0 ? accent : softFill,
                  opacity: i === 0 ? 0.9 : 1,
                }}
              />
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Compare: concurrence — trois “résultats” sur la même ligne de base, le vôtre ressort ── */
    case 'compare':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-8 bottom-8 top-8 flex items-end justify-center gap-2.5 sm:gap-4">
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="h-[52%] min-h-[3.5rem] w-full rounded-2xl" style={{ backgroundColor: soft }} />
              <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: soft }} />
            </div>
            <div className="flex flex-1 flex-col items-center gap-2">
              <div
                className="relative h-[78%] min-h-[5rem] w-full rounded-2xl"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.11)' : 'rgba(17,17,17,0.06)',
                  border: `2px solid ${accent}`,
                }}
              >
                <div className="absolute left-2 right-2 top-2.5 h-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.9 }} />
                <div className="absolute left-2 right-2 top-5 h-1 rounded-full" style={{ backgroundColor: soft }} />
              </div>
              <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: accent }} />
            </div>
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="h-[40%] min-h-[3rem] w-full rounded-2xl" style={{ backgroundColor: soft }} />
              <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: soft }} />
            </div>
          </div>
          <div
            className="absolute bottom-6 left-10 right-10 h-px sm:left-12 sm:right-12"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(17,17,17,0.08)' }}
          />
        </ArtworkSurface>
      );

    /* ── Models: clean model list ── */
    case 'models':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-7 top-1/2 flex -translate-y-1/2 flex-col gap-2.5">
            {['ChatGPT', 'Claude', 'Perplexity'].map((label, i) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ backgroundColor: i === 1 ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.04)') : 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: i === 1 ? accent : soft }}
                  />
                  <span className="text-xs font-medium" style={{ color: i === 1 ? (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(17,17,17,0.7)') : line }}>{label}</span>
                </div>
                <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: i === 1 ? accent : soft }} />
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Price: clean price display ── */
    case 'price':
      return (
        <ArtworkSurface integrated={integrated} dark={false} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-semibold tracking-tight text-[#111111]">9,99€</span>
              <span className="mt-1.5 text-xs font-medium text-[rgba(17,17,17,0.4)]">Paiement unique</span>
            </div>
          </div>
          {/* Subtle accent line */}
          <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-t-full" style={{ backgroundColor: accent }} />
        </ArtworkSurface>
      );

    /* ── QA list: clean question format ── */
    case 'qa-list':
      return (
        <ArtworkSurface integrated={integrated} dark={false} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-6 px-8">
            {/* Question mark icon */}
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'rgba(17,17,17,0.04)', color: '#111111' }}
            >
              <Icon name="question" className="h-7 w-7" />
            </div>
            {/* Answer lines */}
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="h-2 w-20 rounded-full" style={{ backgroundColor: accent }} />
              <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'rgba(17,17,17,0.07)' }} />
              <div className="h-1.5 w-4/5 rounded-full" style={{ backgroundColor: 'rgba(17,17,17,0.05)' }} />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Report: rapport — une feuille avec sections (sommaire lisible) ── */
    case 'report': {
      const sheetBg = isDark ? '#2C2C2E' : '#FFFFFF';
      const sheetEdge = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,17,17,0.08)';
      const headingMuted = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(17,17,17,0.32)';
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center px-6 pb-4 pt-3">
            <div
              className="flex w-full max-w-[15.5rem] flex-col gap-0 rounded-2xl p-3.5 sm:max-w-[17rem]"
              style={{
                backgroundColor: sheetBg,
                border: `1px solid ${sheetEdge}`,
                boxShadow: integrated ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <div className="mb-3 h-2 w-14 rounded-full" style={{ backgroundColor: accent }} />
              {[0, 1, 2].map((sec) => (
                <div key={sec} className="mb-3 last:mb-0">
                  <div className="mb-1.5 h-1.5 w-24 rounded-full" style={{ backgroundColor: headingMuted }} />
                  <div className="h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
                  <div className="mt-1 h-1 w-[88%] rounded-full" style={{ backgroundColor: soft }} />
                  {sec === 0 ? (
                    <div className="mt-2 flex gap-1.5">
                      <div className="h-6 flex-1 rounded-lg" style={{ backgroundColor: softFill }} />
                      <div className="h-6 flex-1 rounded-lg" style={{ backgroundColor: accent, opacity: 0.14 }} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </ArtworkSurface>
      );
    }

    /* ── Pilier technique — couches / profondeur de crawl ── */
    case 'pillar-technical':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-4 px-10">
            <div className="relative flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-9 rounded-xl"
                  style={{
                    width: `${11 - i * 1.25}rem`,
                    marginLeft: `${i * 0.5}rem`,
                    backgroundColor: i === 0 ? softFill : softFill,
                    border: `1px solid ${i === 0 ? accent : soft}`,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-1.5 pt-2">
              {[0, 1, 2, 3].map((d) => (
                <div key={d} className="h-1 w-1 rounded-full" style={{ backgroundColor: d === 3 ? accent : soft }} />
              ))}
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Pilier faits — preuves & lignes citables ── */
    case 'pillar-factual':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-9 inset-y-7 flex flex-col justify-center gap-2.5">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
              <div className="h-2 w-32 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(17,17,17,0.35)' }} />
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-1.5 w-40 rounded-full" style={{ backgroundColor: soft }} />
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-1.5 max-w-[12rem] flex-1 rounded-full" style={{ backgroundColor: soft }} />
            </div>
            <div className="mt-2 flex gap-2 pl-4">
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 opacity-80" fill="none" stroke={accent} strokeWidth="1.4" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" />
              </svg>
              <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: soft }} />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Visibilité — graphe requête / mentions ── */
    case 'visibility-nodes':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 120" className="h-full max-h-[7.5rem] w-full max-w-[14rem]" aria-hidden>
              <line x1="100" y1="60" x2="40" y2="28" stroke={soft} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="100" y1="60" x2="160" y2="28" stroke={soft} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="100" y1="60" x2="32" y2="88" stroke={soft} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="100" y1="60" x2="168" y2="88" stroke={soft} strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="100" cy="60" r="14" fill={accent} opacity="0.95" />
              <circle cx="40" cy="28" r="8" fill="none" stroke={soft} strokeWidth="1.5" />
              <circle cx="160" cy="28" r="8" fill="none" stroke={soft} strokeWidth="1.5" />
              <circle cx="32" cy="88" r="8" fill="none" stroke={soft} strokeWidth="1.5" />
              <circle cx="168" cy="88" r="8" fill="none" stroke={soft} strokeWidth="1.5" />
            </svg>
          </div>
        </ArtworkSurface>
      );

    /* ── Part d’intention — blocs de présence relative ── */
    case 'share-intent':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-10 inset-y-8 flex flex-col justify-center gap-3">
            <div className="flex h-10 overflow-hidden rounded-xl" style={{ border: `1px solid ${soft}` }}>
              <div className="h-full" style={{ width: '42%', backgroundColor: accent, opacity: 0.85 }} />
              <div className="h-full" style={{ width: '33%', backgroundColor: soft }} />
              <div className="h-full flex-1" style={{ backgroundColor: softFill }} />
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-8 rounded-full" style={{ backgroundColor: accent }} />
              <div className="h-2 w-8 rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-2 w-8 rounded-full" style={{ backgroundColor: soft }} />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Angles morts — grille avec case manquante ── */
    case 'gap-scan':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center px-12">
            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 w-16 rounded-xl sm:h-16 sm:w-[4.5rem]"
                  style={
                    i === 2
                      ? { border: `2px dashed ${accent}`, backgroundColor: 'transparent' }
                      : { backgroundColor: softFill, border: `1px solid ${soft}` }
                  }
                >
                  {i !== 2 ? (
                    <div className="m-2.5 flex flex-col gap-1">
                      <div className="h-1 rounded-full" style={{ backgroundColor: soft }} />
                      <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: soft }} />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-6 w-px rotate-45 rounded-full" style={{ backgroundColor: accent, opacity: 0.5 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Perte de place — barres de rang décroissant ── */
    case 'loss-compare':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-10 inset-y-7 flex flex-col justify-end gap-2.5">
            {[88, 68, 48, 32].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 text-right text-[10px] font-semibold tabular-nums" style={{ color: line }}>
                  {i + 1}
                </div>
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${w}%`,
                    backgroundColor: i === 0 ? accent : soft,
                    opacity: i === 0 ? 1 : 0.65,
                  }}
                />
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Clarté marque — une ligne dominante ── */
    case 'clarity-brand':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-14">
            <div className="h-1 w-24 rounded-full" style={{ backgroundColor: soft }} />
            <div className="h-3 w-full max-w-[13rem] rounded-full" style={{ backgroundColor: accent }} />
            <div className="h-1 w-32 rounded-full" style={{ backgroundColor: soft }} />
            <div className="h-1 w-20 rounded-full" style={{ backgroundColor: soft }} />
          </div>
        </ArtworkSurface>
      );

    /* ── Concurrents — rangées comparées ── */
    case 'peer-rows':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-8 inset-y-7 flex flex-col justify-center gap-2.5">
            {[
              { w: '92%', mine: false },
              { w: '100%', mine: true },
              { w: '78%', mine: false },
            ].map((row, i) => (
              <div
                key={i}
                className="flex h-11 items-center rounded-2xl px-3"
                style={{
                  border: row.mine ? `2px solid ${accent}` : `1px solid ${soft}`,
                  backgroundColor: row.mine ? softFill : 'transparent',
                }}
              >
                <div className="h-2 rounded-full" style={{ width: row.w, backgroundColor: row.mine ? accent : soft }} />
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Plan horizontal — jalons numérotés ── */
    case 'action-flow':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-8 inset-y-8 flex flex-col justify-center">
            <div className="relative flex items-center justify-between px-2">
              <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2" style={{ backgroundColor: soft }} />
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: n === 1 ? accent : 'transparent',
                    color: n === 1 ? (isDark ? '#111' : '#FFF') : line,
                    border: n === 1 ? 'none' : `1.5px solid ${soft}`,
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Ce qui remonte — lignes qui gagnent en contraste ── */
    case 'echo-surface':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-12 inset-y-8 flex flex-col justify-center gap-3">
            {[0.2, 0.35, 0.55, 0.9].map((op, i) => (
              <div
                key={i}
                className="h-2 rounded-full"
                style={{
                  width: `${56 + i * 10}%`,
                  backgroundColor: accent,
                  opacity: op,
                }}
              />
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Lecture complète — bloc réponse étendu ── */
    case 'read-complete':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-9 inset-y-5 flex justify-center">
            <div
              className="flex w-full max-w-[13rem] flex-col gap-2 rounded-3xl p-4"
              style={{ border: `1px solid ${soft}`, backgroundColor: softFill }}
            >
              <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: accent }} />
              {[100, 100, 92, 88, 72, 58].map((pct, i) => (
                <div key={i} className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: soft }} />
              ))}
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                <div className="h-1 w-14 rounded-full" style={{ backgroundColor: soft }} />
              </div>
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Triage — trois sources vers une priorité ── */
    case 'focus-fix':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center px-10">
            <svg viewBox="0 0 120 100" className="w-full max-w-[11rem]" aria-hidden>
              <path d="M24 22 L60 48 M96 22 L60 48 M60 78 L60 48" fill="none" stroke={soft} strokeWidth="1.5" strokeLinecap="round" />
              <rect x="12" y="12" width="24" height="16" rx="4" fill={softFill} stroke={soft} />
              <rect x="84" y="12" width="24" height="16" rx="4" fill={softFill} stroke={soft} />
              <rect x="48" y="68" width="24" height="20" rx="6" fill={accent} opacity="0.9" />
            </svg>
          </div>
        </ArtworkSurface>
      );

    /* ── Sans engagement ── */
    case 'no-lock-in':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="h-20 w-20" fill="none" aria-hidden>
              <circle cx="32" cy="36" r="14" stroke={line} strokeWidth="2" />
              <path d="M32 28v-6a8 8 0 0 1 15-2" stroke={accent} strokeWidth="2" strokeLinecap="round" />
              <path d="M18 18 L46 46" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </ArtworkSurface>
      );

    /* ── Relance indépendante — deux analyses séparées ── */
    case 'relance-independent':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-5 px-8">
            <div className="h-24 w-16 rounded-2xl" style={{ border: `1px solid ${soft}`, backgroundColor: softFill }} />
            <svg viewBox="0 0 32 24" className="h-8 w-10 shrink-0" fill="none" aria-hidden>
              <path
                d="M4 12h16M22 8l4 4-4 4"
                stroke={accent}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="h-24 w-16 rounded-2xl"
              style={{ border: `1px solid ${accent}`, backgroundColor: softFill }}
            />
          </div>
        </ArtworkSurface>
      );

    /* ── Pipeline vers le rapport ── */
    case 'report-pipeline':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-2 px-6">
            {['Paiement', 'Analyse', 'Rapport'].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="flex h-12 w-14 flex-col justify-center gap-1 rounded-xl px-2"
                  style={{ border: `1px solid ${i === 2 ? accent : soft}`, backgroundColor: i === 2 ? softFill : 'transparent' }}
                >
                  <div className="h-1 rounded-full" style={{ backgroundColor: i === 2 ? accent : soft }} />
                  <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: soft }} />
                </div>
                {i < 2 ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" className="shrink-0 opacity-70" aria-hidden>
                    <path d="M1 5h8M9 5L6 2.5M9 5L6 7.5" fill="none" stroke={line} strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                ) : null}
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Prêt à l’emploi — ensemble rangé ── */
    case 'ready-pack':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-4 px-10">
            <div
              className="flex h-20 w-24 flex-col justify-center gap-2 rounded-2xl p-3"
              style={{ border: `1px solid ${soft}` }}
            >
              {[0, 1, 2].map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-md" style={{ backgroundColor: accent, opacity: r === 0 ? 1 : 0.35 }} />
                  <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: soft }} />
                </div>
              ))}
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── SaaS — courbe de netteté ── */
    case 'saas-velocity':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center px-12">
            <svg viewBox="0 0 120 64" className="w-full max-w-[13rem]" fill="none" aria-hidden>
              <path d="M8 52 L32 40 L56 44 L80 24 L112 12" stroke={soft} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 52 L32 40 L56 44 L80 24 L112 12" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
              {[32, 56, 80, 112].map((x, i) => (
                <circle key={i} cx={x} cy={[40, 44, 24, 12][i]} r="3" fill={i === 3 ? accent : soft} />
              ))}
            </svg>
          </div>
        </ArtworkSurface>
      );

    /* ── Multi-canaux — tuiles usage ── */
    case 'commerce-channels':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center px-10">
            <div className="grid grid-cols-3 gap-3">
              {[
                <path key="0" d="M6 10h12l-1 8H7l-1-8z M9 10V8a3 3 0 0 1 6 0v2" />,
                <path key="1" d="M12 5C9.2 5 7 7.2 7 10c0 3.5 5 9 5 9s5-5.5 5-9c0-2.8-2.2-5-5-5z" />,
                <g key="2">
                  <rect x="5" y="6" width="14" height="11" rx="2" />
                  <path d="M8 18h8" />
                </g>,
              ].map((el, i) => (
                <div
                  key={i}
                  className="flex h-16 w-14 items-center justify-center rounded-2xl"
                  style={{ border: `1px solid ${soft}`, backgroundColor: i === 1 ? softFill : 'transparent' }}
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    {el}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Site vitrine — héro + colonnes ── */
    case 'fit-showcase':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-8 inset-y-6 flex flex-col gap-2">
            <div className="h-3 rounded-xl" style={{ backgroundColor: accent, opacity: 0.85, maxWidth: '70%' }} />
            <div className="flex flex-1 gap-2">
              <div className="flex-1 rounded-xl" style={{ border: `1px solid ${soft}` }}>
                <div className="m-2 space-y-1.5">
                  <div className="h-1 rounded-full" style={{ backgroundColor: soft }} />
                  <div className="h-1 rounded-full" style={{ width: '83%', backgroundColor: soft }} />
                </div>
              </div>
              <div className="w-14 rounded-xl" style={{ backgroundColor: softFill, border: `1px solid ${soft}` }} />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Périmètre d’analyse — couches empilées ── */
    case 'scope-layers':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-10 inset-y-7 flex flex-col justify-center gap-2">
            {['100%', '88%', '76%', '64%'].map((width, i) => (
              <div key={i} className="flex h-9 items-center rounded-xl px-3" style={{ border: `1px solid ${soft}` }}>
                <div className="h-1.5 rounded-full" style={{ width, backgroundColor: i === 0 ? accent : soft }} />
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Paiement amont — file d’attente sécurisée ── */
    case 'pay-upfront':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-4 px-8">
            <div className="flex h-16 w-20 flex-col justify-between rounded-xl p-2.5" style={{ border: `1px solid ${soft}` }}>
              <div className="h-2 w-8 rounded" style={{ backgroundColor: accent, opacity: 0.8 }} />
              <div className="flex gap-0.5">
                {[0, 1, 2, 3].map((d) => (
                  <span key={d} className="h-1 w-1 rounded-full" style={{ backgroundColor: line }} />
                ))}
              </div>
            </div>
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden>
              <path d="M2 8h11M15 8l-3-3M15 8l-3 3" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <div
              className="flex h-20 w-24 items-center justify-center rounded-xl"
              style={{ border: `2px solid ${accent}`, backgroundColor: softFill, color: accent }}
            >
              <Icon name="bolt" className="h-8 w-8" />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Partage contrôlé — lien privé ── */
    case 'faq-shareable':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-5 px-8">
            <svg viewBox="0 0 48 48" className="h-16 w-16" fill="none" aria-hidden>
              <ellipse cx="24" cy="24" rx="18" ry="12" stroke={soft} strokeWidth="1.5" />
              <path d="M16 24h16" stroke={accent} strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="24" r="4" fill={accent} />
            </svg>
            <div className="flex flex-col gap-2">
              <div className="h-2 w-24 rounded-full" style={{ backgroundColor: accent }} />
              <div className="h-1.5 w-32 rounded-full" style={{ backgroundColor: soft }} />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── Tarifs — plan d’action (impact / ordre) ── */
    case 'pricing-actions':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-8 inset-y-7 flex flex-col justify-center gap-2">
            {[
              { w: '92%', tag: accent },
              { w: '74%', tag: soft },
              { w: '58%', tag: soft },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.tag }} />
                <div className="h-10 flex-1 rounded-2xl px-3" style={{ border: `1px solid ${soft}` }}>
                  <div className="mt-4 h-1.5 rounded-full" style={{ width: row.w, backgroundColor: i === 0 ? accent : soft }} />
                </div>
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── FAQ — formule du score (15 / 15 / 45 / 25) ── */
    case 'score-formula':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-9 inset-y-8 flex flex-col justify-center gap-2">
            {[
              ['15%', '32%'],
              ['15%', '32%'],
              ['45%', '62%'],
              ['25%', '48%'],
            ].map(([label, width], i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-9 text-[10px] font-semibold tabular-nums" style={{ color: line }}>
                  {label}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: soft }}>
                  <div className="h-full rounded-full" style={{ width, backgroundColor: accent }} />
                </div>
              </div>
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── FAQ — données trop clairsemées pour un score ── */
    case 'sparse-data':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-10 inset-y-8 flex flex-col justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-1.5 flex-1 rounded-full"
                  style={{
                    width: `${40 + i * 12}%`,
                    backgroundColor: i === 2 ? 'transparent' : soft,
                    border: i === 2 ? `1px dashed ${accent}` : 'none',
                  }}
                />
              </div>
            ))}
            <div className="mt-1 text-center text-[10px] font-semibold tracking-wide" style={{ color: accent }}>
              N/A
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── FAQ — relire avec contexte ── */
    case 'surprise-context':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-4 px-8">
            <div
              className="flex h-20 w-24 flex-col justify-center gap-2 rounded-2xl p-3"
              style={{ border: `1px solid ${soft}` }}
            >
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-1 w-[90%] rounded-full" style={{ backgroundColor: soft }} />
              <div className="h-1 rounded-full" style={{ width: '75%', backgroundColor: accent, opacity: 0.5 }} />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: softFill, border: `1px solid ${soft}`, color: accent }}>
              <Icon name="eye" className="h-7 w-7" />
            </div>
          </div>
        </ArtworkSurface>
      );

    /* ── FAQ — rapport lisible (grandes lignes) ── */
    case 'readable-report':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-x-10 inset-y-7 flex flex-col justify-center gap-3">
            <div className="h-2.5 max-w-[11rem] rounded-full" style={{ backgroundColor: accent }} />
            {[95, 100, 88, 72].map((pct, i) => (
              <div key={i} className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: soft }} />
            ))}
          </div>
        </ArtworkSurface>
      );

    /* ── Stripe — tunnel carte → traitement ── */
    case 'stripe-link':
      return (
        <ArtworkSurface integrated={integrated} dark={isDark} tall={tall} accent={accent}>
          <div className="absolute inset-0 flex items-center justify-center gap-3 px-8">
            <div
              className="relative h-14 w-24 rounded-lg p-2"
              style={{ backgroundColor: softFill, border: `1px solid ${soft}` }}
            >
              <div className="h-2 w-7 rounded-sm" style={{ backgroundColor: accent }} />
              <div className="mt-2 h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: softFill, border: `1px solid ${soft}`, color: accent }}
            >
              <Icon name="lock" className="h-5 w-5" />
            </div>
          </div>
        </ArtworkSurface>
      );
  }
}
