'use client';

import { useId, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { ResourceArticleFaq as ResourceArticleFaqItem } from '@/app/lib/resources-content';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 14 14"
      fill="none"
      className={`shrink-0 text-[#86868B] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path
        d="M3.5 5.25L7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResourceArticleFaq({ items }: { items: ResourceArticleFaqItem[] }) {
  const baseId = useId();
  const reduceMotion = useReducedMotion();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const slideDuration = reduceMotion ? 'duration-0' : 'duration-300';
  const slideEase = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <div className="mt-8 overflow-hidden rounded-[34px] border border-black/8 bg-white">
      <ul>
        {items.map((item, index) => {
          const key = `${index}`;
          const isOpen = openKey === key;
          const isLast = index === items.length - 1;
          const panelId = `${baseId}-${key}-panel`;
          const buttonId = `${baseId}-${key}-btn`;
          return (
            <li key={item.question} className="border-t border-black/[0.08] first:border-t-0">
              <button
                type="button"
                id={buttonId}
                className="flex w-full items-start justify-between gap-3 px-5 py-6 text-left transition-colors hover:bg-black/[0.02] sm:gap-4 sm:px-8 sm:py-8"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenKey(isOpen ? null : key)}
              >
                <span className="min-w-0 flex-1 text-[1.15rem] font-semibold leading-snug tracking-tight text-[#111111] sm:text-[1.35rem] sm:leading-tight">
                  {item.question}
                </span>
                <Chevron open={isOpen} />
              </button>
              <div
                className={`grid transition-[grid-template-rows] ${slideDuration} ${slideEase} ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isOpen}
                    className={`border-t border-black/[0.06] bg-white px-6 pb-7 pt-3 sm:px-10 sm:pb-9 sm:pt-4 ${isLast && isOpen ? 'rounded-b-[34px]' : ''}`}
                  >
                    <p className="text-base leading-relaxed text-[#5C5C64] sm:text-lg sm:leading-8">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
