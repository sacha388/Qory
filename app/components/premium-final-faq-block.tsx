'use client';

import { useId, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { PremiumStaticFinalFaq } from '@/app/lib/premium-static-pages-content';

/** Titre FAQ (fin de page) — échelle « grande » (référence par défaut). */
export const PREMIUM_FINAL_FAQ_HEADLINE_CLASSNAME =
  'text-balance text-center text-[2.7rem] font-semibold leading-[0.94] tracking-tight text-[#111111] sm:text-[4rem]';

/** Bandeau vert tarifs : h1 (taille propre à la page, plus imposante que le titre FAQ). */
export const PREMIUM_TARIFS_GREEN_BAND_H1_CLASSNAME =
  'text-balance text-center text-[3.05rem] font-semibold leading-[0.92] tracking-[-0.02em] text-white sm:text-[4.35rem] md:text-[4.85rem]';

/** Page tarifs : titre FAQ (légèrement plus petit que l’échelle « inversion » d’origine). */
export const PREMIUM_TARIFS_FAQ_HEADLINE_COMPACT_CLASSNAME =
  'text-balance text-center text-[2.05rem] font-semibold leading-[0.95] tracking-tight text-[#111111] sm:text-[2.8rem] md:text-[3.15rem]';

function FinalFaqChevron({ open }: { open: boolean }) {
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

type PremiumFinalFaqBlockProps = {
  faq: PremiumStaticFinalFaq;
  /** Remplace les classes du titre ; si absent, style par défaut du bloc FAQ. */
  faqTitleClassName?: string;
  /** Questions et réponses plus petites (page tarifs). */
  compactItems?: boolean;
};

function resolvePremiumFinalFaqTitleClassName(faqTitleClassName: string | undefined): string {
  return faqTitleClassName ?? PREMIUM_FINAL_FAQ_HEADLINE_CLASSNAME;
}

const finalFaqQuestionClassDefault =
  'inline-block whitespace-nowrap text-[1.35rem] font-semibold leading-none tracking-tight text-[#111111] sm:text-[1.55rem] lg:text-[1.75rem]';
const finalFaqQuestionClassCompact =
  'inline-block whitespace-nowrap text-[1.18rem] font-semibold leading-none tracking-tight text-[#111111] sm:text-[1.38rem] lg:text-[1.5rem]';

const finalFaqAnswerClassDefault = 'text-lg leading-8 text-[#5C5C64] sm:text-xl sm:leading-9';
const finalFaqAnswerClassCompact = 'text-base leading-7 text-[#5C5C64] sm:text-lg sm:leading-8';

export default function PremiumFinalFaqBlock({
  faq,
  faqTitleClassName,
  compactItems = false,
}: PremiumFinalFaqBlockProps) {
  const reduceMotion = useReducedMotion();
  const finalFaqBaseId = useId();
  const [finalFaqOpenKey, setFinalFaqOpenKey] = useState<string | null>(null);
  const faqSlideDuration = reduceMotion ? 'duration-0' : 'duration-300';
  const faqSlideEase = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <section className="relative px-4 pb-20 pt-8 sm:px-6 sm:pb-24 md:pb-28">
      <div className="mx-auto max-w-5xl">
        <h2 className={resolvePremiumFinalFaqTitleClassName(faqTitleClassName)}>
          {faq.title}
        </h2>
        <div className="mt-10 overflow-hidden rounded-[38px] border border-black/8 bg-white sm:mt-12">
          <ul>
            {faq.items.map((item, index) => {
              const key = `final-faq-${index}`;
              const isOpen = finalFaqOpenKey === key;
              const isLast = index === faq.items.length - 1;
              const panelId = `${finalFaqBaseId}-${key}-panel`;
              const buttonId = `${finalFaqBaseId}-${key}-btn`;
              return (
                <li key={key} className="border-t border-black/[0.08] first:border-t-0">
                  <button
                    type="button"
                    id={buttonId}
                    className="flex w-full flex-nowrap items-center justify-between gap-2 px-5 py-6 text-left transition-colors hover:bg-black/[0.02] sm:gap-3 sm:px-8 sm:py-8"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setFinalFaqOpenKey(isOpen ? null : key)}
                  >
                    <span className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <span
                        className={compactItems ? finalFaqQuestionClassCompact : finalFaqQuestionClassDefault}
                      >
                        {item.question}
                      </span>
                    </span>
                    <FinalFaqChevron open={isOpen} />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] ${faqSlideDuration} ${faqSlideEase} ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        aria-hidden={!isOpen}
                        className={`border-t border-black/[0.06] bg-white px-6 pb-7 pt-3 sm:px-10 sm:pb-9 sm:pt-4 ${isLast && isOpen ? 'rounded-b-[38px]' : ''}`}
                      >
                        <p className={compactItems ? finalFaqAnswerClassCompact : finalFaqAnswerClassDefault}>
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
      </div>
    </section>
  );
}
