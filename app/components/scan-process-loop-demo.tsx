'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;
const LOOP_DURATION_MS = 5600;
const DOTS_INTERVAL_MS = 500;

type ScanPhase = 'phase-1' | 'phase-2' | 'phase-3' | 'reset';

type ScanProcessLoopDemoProps = {
  className?: string;
};

const loadingTitles = [
  'Préparation de votre audit',
  'Scan de visibilité multi-IA',
  'Consolidation des résultats',
] as const;

function getProgressValue(phase: ScanPhase) {
  if (phase === 'phase-1') return 0.32;
  if (phase === 'phase-2') return 0.67;
  if (phase === 'phase-3') return 0.94;
  if (phase === 'reset') return 0.08;
  return 0.06;
}

function getTitleIndex(phase: ScanPhase) {
  if (phase === 'phase-1') return 0;
  if (phase === 'phase-2') return 1;
  if (phase === 'phase-3') return 2;
  return 0;
}

export function ScanProcessLoopDemo({
  className = '',
}: ScanProcessLoopDemoProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<ScanPhase>(
    prefersReducedMotion ? 'phase-3' : 'phase-1'
  );
  const [dotsCount, setDotsCount] = useState(1);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('phase-3');
      return;
    }

    let cancelled = false;
    const timeoutIds = new Set<number>();

    const schedule = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId);

        if (!cancelled) {
          callback();
        }
      }, delay);

      timeoutIds.add(timeoutId);
    };

    const startCycle = () => {
      setPhase('phase-1');

      schedule(() => setPhase('phase-2'), 1850);
      schedule(() => setPhase('phase-3'), 3380);
      schedule(() => setPhase('reset'), 5060);
      schedule(startCycle, LOOP_DURATION_MS);
    };

    startCycle();

    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIds.clear();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || phase === 'reset') {
      setDotsCount(1);
      return;
    }

    const timer = window.setInterval(() => {
      setDotsCount((previous) => (previous === 3 ? 1 : previous + 1));
    }, DOTS_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [phase, prefersReducedMotion]);

  const titleIndex = getTitleIndex(phase);
  const progressValue = getProgressValue(phase);
  const animatedTitle =
    `${loadingTitles[phase === 'reset' ? 2 : titleIndex]}${'.'.repeat(
      phase === 'reset' ? 1 : dotsCount
    )}`;
  const showFlash = phase === 'phase-3';

  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto aspect-[1.18/0.82] w-full max-w-[320px] overflow-hidden rounded-[24px] bg-[#FFFFFF] ${className}`.trim()}
    >
      <div className="relative flex h-full flex-col items-center justify-center gap-2.5 px-4 py-5 text-center sm:px-5 sm:py-6">
        <div className="min-h-[74px] max-w-[18ch]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${phase}-${titleIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.36, ease: SOFT_EASE }}
            >
              <h4 className="text-[1.05rem] font-semibold leading-[1.18] tracking-tight text-[#1D1D1F] sm:text-[1.14rem]">
                {animatedTitle}
              </h4>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full max-w-[232px] -translate-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-[#F5F5F7]">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r from-[#4BA7F5] to-[#2997FF] ${
                showFlash ? 'brightness-110' : ''
              }`}
              animate={{ width: `${progressValue * 100}%` }}
              transition={{
                width: { duration: 0.62, ease: 'linear' },
                filter: { duration: 0.5, ease: 'easeOut' },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanProcessLoopDemo;
