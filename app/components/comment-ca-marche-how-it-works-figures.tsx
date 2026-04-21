'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Globe02Icon } from '@hugeicons/core-free-icons';
import type { PremiumHowItWorksVisual } from '@/app/lib/premium-static-pages-content';

const CRAWL_DEMO_URL = 'https://qory.fr';
const CRAWL_PLACEHOLDER_URL = 'https://votre-site.fr';

function DemoMouseCursor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M4 3L4 25L10.5 17.5L15.5 26L18.5 24.5L13.5 16L22 14.5L4 3Z"
        className="fill-white"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CRAWL_CURSOR_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const CRAWL_CURSOR_HOME = {
  left: '72%',
  top: '78%',
  scale: 1,
  rotate: -6,
};

const CRAWL_CURSOR_ON_INPUT = {
  left: '34%',
  top: '50%',
  scale: 1,
  rotate: -1,
};

function HowItWorksCrawlAnimated({ shell }: { shell: string }) {
  const reduceMotion = useReducedMotion();
  const cursorControls = useAnimation();
  const [loopId, setLoopId] = useState(0);
  const [typed, setTyped] = useState('');
  const [fieldActivated, setFieldActivated] = useState(false);
  const cycleHandledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    setTyped('');
    setFieldActivated(false);
    cycleHandledRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, [loopId, reduceMotion]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;
    setTyped(CRAWL_DEMO_URL);
    setFieldActivated(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;

    const startTyping = () => {
      if (cycleHandledRef.current) return;
      cycleHandledRef.current = true;
      setFieldActivated(true);
      let i = 0;
      intervalRef.current = setInterval(() => {
        i += 1;
        setTyped(CRAWL_DEMO_URL.slice(0, i));
        if (i >= CRAWL_DEMO_URL.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          holdTimeoutRef.current = setTimeout(() => {
            setLoopId((k) => k + 1);
          }, 1600);
        }
      }, 64);
    };

    void (async () => {
      cursorControls.set(CRAWL_CURSOR_HOME);
      if (cancelled) return;

      await cursorControls.start({
        ...CRAWL_CURSOR_ON_INPUT,
        transition: { duration: 1.2, ease: CRAWL_CURSOR_EASE },
      });
      if (cancelled) return;

      await cursorControls.start({
        scale: 0.86,
        transition: { duration: 0.07, ease: 'easeOut' },
      });
      if (cancelled) return;

      await cursorControls.start({
        scale: 1,
        transition: { duration: 0.11, ease: 'easeOut' },
      });
      if (cancelled) return;

      startTyping();
      if (cancelled) return;

      await cursorControls.start({
        ...CRAWL_CURSOR_HOME,
        transition: { duration: 1.1, ease: CRAWL_CURSOR_EASE },
      });
    })();

    return () => {
      cancelled = true;
      cursorControls.stop();
    };
  }, [loopId, reduceMotion, cursorControls]);

  return (
    <div className={shell} aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
        <div className="relative flex h-full min-h-0 w-full items-center">
          {!reduceMotion ? (
            <motion.div
              className="pointer-events-none absolute z-30 -ml-1 -mt-1"
              initial={CRAWL_CURSOR_HOME}
              animate={cursorControls}
            >
              <DemoMouseCursor className="h-14 w-14 text-[#111] drop-shadow-[0_3px_10px_rgba(0,0,0,0.22)] sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]" />
            </motion.div>
          ) : null}

          <div className="flex w-full justify-start">
            <div className="w-[218%] min-w-[29rem] translate-x-[7%] sm:w-[232%] sm:min-w-[34rem] sm:translate-x-[9%] md:w-[248%] md:min-w-[40rem] md:translate-x-[11%]">
              <div className="relative flex min-h-[68px] items-center overflow-hidden rounded-[30px] border border-white/[0.12] bg-white/[0.08] p-1 sm:min-h-[78px] sm:rounded-[34px] sm:p-[6px] md:min-h-[86px] md:rounded-[36px] md:p-[7px]">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white sm:left-5 md:left-6">
                  <HugeiconsIcon
                    icon={Globe02Icon}
                    size={30}
                    className="h-[24px] w-[24px] opacity-40 sm:h-[27px] sm:w-[27px] md:h-[30px] md:w-[30px] [&_*]:[stroke-linecap:butt] [&_*]:[stroke-linejoin:miter]"
                    aria-hidden
                  />
                </span>
                <div className="relative flex min-h-[1.35em] min-w-0 flex-1 items-center overflow-hidden pl-12 text-left sm:pl-[3.25rem] md:pl-[3.75rem]">
                  {!fieldActivated && !reduceMotion ? (
                    <span
                      key={loopId}
                      className="pointer-events-none absolute left-12 top-1/2 z-10 max-w-[calc(100%-0.75rem)] -translate-y-1/2 truncate text-lg font-medium text-white/50 sm:left-[3.25rem] sm:text-xl md:left-[3.75rem] md:text-2xl"
                      aria-hidden
                    >
                      {CRAWL_PLACEHOLDER_URL}
                    </span>
                  ) : null}
                  <span
                    className={`relative min-w-0 truncate font-medium text-lg sm:text-xl md:text-2xl ${
                      typed ? 'z-[1] text-white' : 'z-0 text-transparent'
                    }`}
                  >
                    {typed}
                  </span>
                  {typed.length > 0 && !reduceMotion ? (
                    <motion.span
                      className="relative z-[1] ml-0.5 inline-block h-[1em] w-px shrink-0 bg-white/70"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-[24px] border border-white/[0.14] bg-white/[0.12] px-6 text-base font-semibold whitespace-nowrap text-white sm:h-[62px] sm:rounded-[28px] sm:px-8 sm:text-lg md:h-[68px] md:rounded-[30px] md:px-10 md:text-xl">
                  Analyser
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksAnalyseVisual({ shell }: { shell: string }) {
  const logo =
    'absolute h-[4.35rem] w-auto max-w-[92%] object-contain sm:h-[5.5rem] md:h-[6.75rem] lg:h-28';

  return (
    <div className={shell} aria-hidden>
      <div className="absolute inset-0 p-5 sm:p-7 md:p-8">
        <div className="relative mx-auto h-full min-h-[12.5rem] w-full max-w-[22rem] sm:min-h-[14rem] md:min-h-[16rem]">
          <Image
            src="/claudelanding.svg"
            alt=""
            width={320}
            height={110}
            className={`${logo} right-[0%] top-[5%] sm:top-[3%] md:right-[1%]`}
          />
          <Image
            src="/perplexitylanding.svg"
            alt=""
            width={320}
            height={110}
            className={`${logo} left-[0%] top-[38%] sm:top-[36%] md:top-[34%]`}
          />
          <Image
            src="/openailanding.svg"
            alt=""
            width={320}
            height={110}
            className={`${logo} left-[40%] top-[58%] sm:left-[42%] sm:top-[56%] md:left-[44%] md:top-[54%]`}
          />
        </div>
      </div>
    </div>
  );
}

/** Cartes visuelles page Comment ça marche : même noir que le footer (#121418). */
export const HOW_IT_WORKS_SHELL =
  'relative aspect-[4/3] w-full max-w-[min(100%,28rem)] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#121418] sm:rounded-[2.25rem] md:justify-self-end';

/**
 * Visuel seul (sans bordure/radius) — pour carte empilée dont le parent applique `rounded` + bordure.
 */
export const HOW_IT_WORKS_VISUAL_SHELL_EMBEDDED =
  'relative aspect-[4/3] w-full overflow-hidden bg-[#121418]';

const HOW_IT_WORKS_RAPPORT_BAR_HEIGHTS_PCT = [100, 33, 75, 50] as const;

function HowItWorksRapportBarsVisual({ shell }: { shell: string }) {
  return (
    <div className={shell} aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-7 md:p-8">
        <div className="flex h-[10.5rem] w-full max-w-[15rem] items-end justify-center gap-3 sm:h-[12rem] sm:max-w-[17rem] sm:gap-[0.95rem] md:h-[13rem] md:max-w-[18rem]">
          {HOW_IT_WORKS_RAPPORT_BAR_HEIGHTS_PCT.map((pct, i) => (
            <div
              key={i}
              className="w-[18%] max-w-[2.85rem] shrink-0 rounded-full bg-white sm:max-w-[3.15rem] md:max-w-[3.35rem]"
              style={{ height: `${pct}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HowItWorksFigure({
  visual,
  shellClassName,
}: {
  visual: PremiumHowItWorksVisual;
  /** Par défaut `HOW_IT_WORKS_SHELL` ; pour cartes empilées utiliser `HOW_IT_WORKS_VISUAL_SHELL_EMBEDDED`. */
  shellClassName?: string;
}) {
  const shell = shellClassName ?? HOW_IT_WORKS_SHELL;

  if (visual === 'crawl') {
    return <HowItWorksCrawlAnimated shell={shell} />;
  }

  if (visual === 'analyse') {
    return <HowItWorksAnalyseVisual shell={shell} />;
  }

  return <HowItWorksRapportBarsVisual shell={shell} />;
}
