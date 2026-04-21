'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

export const REPORT_DECO_BLUE = '#4BA7F5';
export const REPORT_DECO_GREEN = '#69D33F';
export const REPORT_DECO_CORAL = '#F16B5D';
export const REPORT_DECO_AMBER = '#F4B43A';

/** Titre en clair sur fond sombre → fonds plus soutenus pour garder le texte blanc lisible sans changer sa couleur. */
/** Titre foncé sur fond clair → couleurs carrousel pleines. */
export type TitleDecoInk = 'onDark' | 'onLight';

const PILL_FLAT: Record<string, Record<TitleDecoInk, string>> = {
  [REPORT_DECO_BLUE]: { onDark: '#2E7CB8', onLight: '#4BA7F5' },
  [REPORT_DECO_GREEN]: { onDark: '#4F9E38', onLight: '#69D33F' },
  [REPORT_DECO_CORAL]: { onDark: '#F16B5D', onLight: '#F16B5D' },
  [REPORT_DECO_AMBER]: { onDark: '#F4B43A', onLight: '#F4B43A' },
};

function pillFlatBg(color: string, ink: TitleDecoInk): string {
  return PILL_FLAT[color]?.[ink] ?? color;
}

/** Courbe posée : démarrage doux, fin bien amortie (effet « dessin maîtrisé »). */
const DRAW_EASE = [0.45, 0, 0.25, 1] as const;
/** Délai entre deux décors dans le même titre. */
const REVEAL_STAGGER_SEC = 0.22;
const PILL_DRAW_SEC = 0.78;
const SCRIBBLE_DRAW_SEC = 0.88;

/**
 * Capsule type réf. : fond révélé au scroll (élargissement gauche → droite).
 * `revealOrder` : 0 pour le premier décor du titre, 1 pour le second, etc.
 */
export function TitleDecoPill({
  children,
  color,
  titleInk,
  revealOrder = 0,
}: {
  children: ReactNode;
  color: string;
  titleInk: TitleDecoInk;
  /** Ordre dans le titre quand plusieurs décors (décalage court entre chaque). */
  revealOrder?: number;
}) {
  const bg = pillFlatBg(color, titleInk);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35, margin: '-8% 0px' });
  const reduceMotion = useReducedMotion();
  const drawn = Boolean(reduceMotion || inView);
  const delay = revealOrder * REVEAL_STAGGER_SEC;

  return (
    <span ref={ref} className="relative z-0 inline align-baseline text-inherit">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -z-10 rounded-full max-md:hidden"
        style={{
          backgroundColor: bg,
          left: '-0.11em',
          right: '-0.26em',
          top: '0.155em',
          bottom: '0.155em',
          transformOrigin: 'left center',
        }}
        initial={false}
        animate={{ scaleX: drawn ? 1 : 0 }}
        transition={{
          scaleX: { duration: PILL_DRAW_SEC, delay: reduceMotion ? 0 : delay, ease: DRAW_EASE },
        }}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}

/** Soulignement dessiné révélé au scroll (tracé gauche → droite). */
export function TitleDecoScribble({
  children,
  color,
  revealOrder = 0,
  underline = true,
  /** Sur mobile par défaut le tracé est masqué (`max-md:hidden`). À activer pour le seul mot souligné du hero (ex. « vous »). */
  showUnderlineOnMobile = false,
}: {
  children: ReactNode;
  color: string;
  revealOrder?: number;
  /** Faux : texte coloré sans tracé souligné (ex. CTA). */
  underline?: boolean;
  showUnderlineOnMobile?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35, margin: '-8% 0px' });
  const reduceMotion = useReducedMotion();
  const drawn = Boolean(reduceMotion || inView);
  const delay = revealOrder * REVEAL_STAGGER_SEC;

  return (
    <span ref={ref} className="relative inline-block">
      <span className="relative z-[2]">{children}</span>
      {underline ? (
        <svg
          className={`pointer-events-none absolute -bottom-[0.18em] left-[-0.04em] z-[1] h-[0.42em] w-[calc(100%+0.12em)] min-h-[11px] overflow-visible sm:-bottom-[0.2em] sm:h-[0.38em] ${showUnderlineOnMobile ? '' : 'max-md:hidden'}`}
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M3 8.5 C22 5 44 10.5 62 7 S82 9.5 97 6.8"
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={{
              pathLength: { duration: SCRIBBLE_DRAW_SEC, delay: reduceMotion ? 0 : delay, ease: DRAW_EASE },
            }}
          />
        </svg>
      ) : null}
    </span>
  );
}
