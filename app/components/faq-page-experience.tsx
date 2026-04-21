'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import { faqChapters, faqFinalCta, faqPageMeta } from '@/app/lib/faq-page-content';

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
      <path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FaqPageExperience() {
  const baseId = useId();
  const reduceMotion = useReducedMotion();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState(faqChapters[0]?.id ?? '');
  const ratiosRef = useRef<Record<string, number>>({});

  const slideDuration = reduceMotion ? 'duration-0' : 'duration-300';
  const slideEase = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

  useEffect(() => {
    const sections = faqChapters
      .map((ch) => document.getElementById(ch.id))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (sections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratiosRef.current[(entry.target as HTMLElement).id] = entry.isIntersecting
            ? entry.intersectionRatio
            : 0;
        });

        const active = faqChapters
          .map((ch) => ({
            id: ch.id,
            ratio: ratiosRef.current[ch.id] ?? 0,
          }))
          .sort((a, b) => b.ratio - a.ratio)[0];

        if (active && active.ratio > 0.1) {
          setActiveSectionId(active.id);
        }
      },
      {
        threshold: [0.08, 0.16, 0.24, 0.36, 0.48, 0.6],
        rootMargin: '-20% 0px -20% 0px',
      }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeChapter = faqChapters.find((c) => c.id === activeSectionId) ?? faqChapters[0];

  return (
    <main className="site-grid-bg relative min-h-screen overflow-x-clip bg-white">
      <SiteHeader variant="dark" position="fixed" landingMinimal landingMinimalLightSurface />

      <section className="relative flex min-h-svh flex-col items-center justify-center bg-white px-4 pb-[5.25rem] pt-[5.25rem] sm:px-6 sm:pb-24 sm:pt-24 md:pb-28 md:pt-28">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <img
            src="/logo.svg"
            alt="Qory"
            className="mx-auto mb-8 h-[4.75rem] w-[4.75rem] sm:h-[5.4rem] sm:w-[5.4rem]"
          />
          <h1 className="max-w-5xl text-balance text-[3.25rem] font-semibold leading-[0.92] tracking-tight text-[#111111] sm:text-[4.9rem] lg:text-[6.25rem]">
            {faqPageMeta.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#5C5C64] sm:text-lg">
            {faqPageMeta.heroDescription}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={faqPageMeta.primaryHref}
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#000000] sm:text-base"
            >
              {faqPageMeta.primaryLabel}
            </Link>
            <Link
              href={faqPageMeta.secondaryHref}
              className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 bg-white px-7 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F5F5F7] sm:text-base"
            >
              {faqPageMeta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative cv-auto">
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ backgroundColor: activeChapter?.background ?? '#ffffff' }}
          transition={{
            duration: reduceMotion ? 0 : 2.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <div className="relative z-10">
          {faqChapters.map((chapter) => (
            <section
              key={chapter.id}
              id={chapter.id}
              data-faq-chapter
              className="relative cv-auto flex min-h-[120svh] items-center px-4 py-20 sm:px-6 sm:py-24 md:py-28"
            >
              <div className="mx-auto w-full max-w-6xl">
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-4xl text-center"
                >
                  <h2 className="text-balance text-[3.35rem] font-semibold leading-[0.92] tracking-tight text-white sm:text-[4.8rem] lg:text-[6rem]">
                    {chapter.title}
                  </h2>
                </motion.div>

                <div className="mt-12 overflow-hidden rounded-[34px] border border-black/8 bg-white lg:mt-16">
                  <ul>
                    {chapter.items.map((item, index) => {
                      const key = `${chapter.id}-${index}`;
                      const isOpen = openKey === key;
                      const isLast = index === chapter.items.length - 1;
                      const panelId = `${baseId}-${key}-panel`;
                      const buttonId = `${baseId}-${key}-btn`;
                      return (
                        <li key={key} className="border-t border-black/[0.08] first:border-t-0">
                          <button
                            type="button"
                            id={buttonId}
                            className="flex w-full flex-nowrap items-center justify-between gap-2 px-5 py-6 text-left transition-colors hover:bg-black/[0.02] sm:gap-3 sm:px-8 sm:py-8"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => setOpenKey(isOpen ? null : key)}
                          >
                            <span className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                              <span className="inline-block whitespace-nowrap text-[1.35rem] font-semibold leading-none tracking-tight text-[#111111] sm:text-[1.55rem] lg:text-[1.75rem]">
                                {item.question}
                              </span>
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
                                <p className="text-lg leading-8 text-[#5C5C64] sm:text-xl sm:leading-9">
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
          ))}

          <section className="relative cv-auto px-4 pb-20 pt-8 sm:px-6 sm:pb-24 md:pb-28">
            <div className="mx-auto max-w-5xl rounded-[38px] border border-black/8 bg-white px-6 py-10 sm:px-10 sm:py-12">
              <div className="text-center">
                <h2 className="text-balance text-[2.7rem] font-semibold leading-[0.94] tracking-tight text-[#111111] sm:text-[4rem]">
                  {faqFinalCta.title}
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5C5C64] sm:text-lg">
                  {faqFinalCta.body}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={faqFinalCta.primaryHref}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#000000] sm:text-base"
                  >
                    {faqFinalCta.primaryLabel}
                  </Link>
                  <Link
                    href={faqFinalCta.secondaryHref}
                    className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 bg-[#F5F5F7] px-7 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#ECECF1] sm:text-base"
                  >
                    {faqFinalCta.secondaryLabel}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}
