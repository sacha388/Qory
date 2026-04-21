'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Globe02Icon } from '@hugeicons/core-free-icons';

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;
const LOOP_DURATION_MS = 5400;
const DEFAULT_URL = 'https://exemple-site.fr';

type DemoPhase = 'idle' | 'approach' | 'focus' | 'typing' | 'validated' | 'reset';

type UrlInputLoopDemoProps = {
  className?: string;
  url?: string;
};

function PointerCursor() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        d="M7 4.8 23.2 16l-7.4 1.4 4.7 8.1-3.3 1.9-4.6-8-4.6 5.9L7 4.8Z"
        fill="#1D1D1F"
      />
      <path
        d="M7 4.8 23.2 16l-7.4 1.4 4.7 8.1-3.3 1.9-4.6-8-4.6 5.9L7 4.8Z"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getCursorTarget(phase: DemoPhase) {
  if (phase === 'approach') {
    return { left: '46%', top: '56%', scale: 1 };
  }

  if (phase === 'focus' || phase === 'typing' || phase === 'validated') {
    return { left: '26%', top: '55%', scale: 1 };
  }

  if (phase === 'reset') {
    return { left: '81%', top: '18%', scale: 0.94 };
  }

  return { left: '82%', top: '18%', scale: 1 };
}

export function UrlInputLoopDemo({
  className = '',
  url = DEFAULT_URL,
}: UrlInputLoopDemoProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<DemoPhase>(
    prefersReducedMotion ? 'validated' : 'idle'
  );
  const [typedValue, setTypedValue] = useState(prefersReducedMotion ? url : '');
  const [pointerPressed, setPointerPressed] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('validated');
      setTypedValue(url);
      setPointerPressed(false);
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
      setPhase('idle');
      setTypedValue('');
      setPointerPressed(false);

      schedule(() => setPhase('approach'), 700);
      schedule(() => {
        setPhase('focus');
        setPointerPressed(true);
      }, 1320);
      schedule(() => setPointerPressed(false), 1440);
      schedule(() => setPhase('typing'), 1500);

      Array.from(url).forEach((_, index) => {
        schedule(() => setTypedValue(url.slice(0, index + 1)), 1580 + index * 56);
      });

      schedule(() => setPhase('validated'), 1580 + url.length * 56 + 220);
      schedule(() => setPhase('reset'), 4400);
      schedule(() => {
        setPhase('idle');
        setTypedValue('');
        setPointerPressed(false);
      }, 4920);
      schedule(startCycle, LOOP_DURATION_MS);
    };

    startCycle();

    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIds.clear();
    };
  }, [prefersReducedMotion, url]);

  const isFocused =
    phase === 'focus' || phase === 'typing' || phase === 'validated';
  const showCaret =
    !prefersReducedMotion && (phase === 'focus' || phase === 'typing');
  const cursorTarget = getCursorTarget(phase);

  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto aspect-[1.18/0.82] w-full max-w-[320px] overflow-hidden rounded-[24px] bg-[#FFFFFF] ${className}`.trim()}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '26% 55%' }}
        animate={{
          scale: prefersReducedMotion
            ? 1
            : isFocused
              ? 1.08
              : phase === 'reset'
                ? 1.03
                : 1,
          y: prefersReducedMotion ? 0 : isFocused ? -5 : phase === 'reset' ? -2 : 0,
        }}
        transition={{ duration: 0.9, ease: SOFT_EASE }}
      >
        <div className="absolute left-3 right-[-34px] top-1/2 -translate-y-1/2 sm:left-4 sm:right-[-40px]">
          <motion.div
            className="relative flex min-h-[62px] items-center rounded-[31px] p-[5px] sm:min-h-[66px] sm:rounded-[33px] sm:p-[7px]"
            animate={{
              backgroundColor: isFocused
                ? 'rgba(242, 242, 244, 1)'
                : 'rgba(245, 245, 247, 1)',
              boxShadow: 'none',
            }}
            transition={{ duration: 0.42, ease: SOFT_EASE }}
          >
            <span className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-[#6B7280] sm:left-5">
              <HugeiconsIcon
                icon={Globe02Icon}
                size={22}
                className="h-[22px] w-[22px] [&_*]:[stroke-linecap:butt] [&_*]:[stroke-linejoin:miter]"
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0 flex-1 overflow-hidden pl-12 pr-3 sm:pl-14 sm:pr-4">
              <div className="whitespace-nowrap text-left text-[13px] font-medium tracking-tight text-[#1D1D1F] sm:text-[14px]">
                {typedValue ? (
                  <>
                    {typedValue}
                    {showCaret ? (
                      <motion.span
                        className="ml-0.5 inline-block h-[1.1em] w-px align-[-0.14em] bg-[#1D1D1F]"
                        animate={{ opacity: [1, 0.15, 1] }}
                        transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    ) : null}
                  </>
                ) : (
                  <span className="text-[#6B7280]">https://votre-site.fr</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {!prefersReducedMotion ? (
        <motion.div
          className="pointer-events-none absolute z-20"
          animate={{
            left: cursorTarget.left,
            top: cursorTarget.top,
            opacity: 1,
            scale: pointerPressed ? 0.94 : cursorTarget.scale,
          }}
          transition={{
            duration: phase === 'typing' ? 0.32 : 0.82,
            ease: SOFT_EASE,
          }}
        >
          <div className="relative -translate-x-[18%] -translate-y-[12%]">
            <motion.div
              className="absolute left-[3px] top-[6px] h-8 w-8 rounded-full bg-black/6 blur-md"
              animate={{
                opacity: pointerPressed ? 0.26 : 0.12,
                scale: pointerPressed ? 1.35 : 1,
              }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            />
            <motion.div
              className="absolute left-[8px] top-[12px] h-5 w-5 rounded-full border border-black/20"
              animate={{
                scale: pointerPressed ? [0.7, 1.8] : 0.7,
                opacity: pointerPressed ? [0.4, 0] : 0,
              }}
              transition={{ duration: 0.34, ease: SOFT_EASE }}
            />
            <PointerCursor />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export default UrlInputLoopDemo;
