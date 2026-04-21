'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import PremiumFinalFaqBlock from '@/app/components/premium-final-faq-block';
import PremiumStaticCardArtwork from '@/app/components/premium-static-card-artwork';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import type {
  PremiumStaticCard,
  PremiumStaticPageData,
  PremiumStaticSection,
} from '@/app/lib/premium-static-pages-content';

type PremiumStaticPageExperienceProps = {
  page: PremiumStaticPageData;
};

function cardSpanClass(size: PremiumStaticCard['size']) {
  if (size === 'full') {
    return 'md:col-span-12';
  }

  if (size === 'wide') {
    return 'md:col-span-12';
  }

  return 'md:col-span-6 lg:col-span-6';
}

function headlineTextClass(size: PremiumStaticCard['size']) {
  return size === 'full'
    ? 'max-w-[20ch] text-[2.6rem] sm:text-[3.5rem]'
    : 'max-w-[20ch] text-[2.35rem] sm:text-[3rem]';
}

function PremiumCard({
  card,
  index,
}: {
  card: PremiumStaticCard;
  index: number;
}) {
  const isDark = card.tone === 'dark';
  const hasArtwork = card.artwork !== 'none';
  const integratedArt = hasArtwork && card.artworkIntegrated;
  const bodyHeadline = card.bodyHeadline === true && card.body;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      className={`${cardSpanClass(card.size)} relative overflow-hidden rounded-[34px] border px-6 py-7 sm:px-8 sm:py-9 ${
        hasArtwork ? (integratedArt ? 'lg:min-h-[23rem]' : 'lg:min-h-[24rem]') : 'lg:min-h-[15rem]'
      }`}
      style={{
        backgroundColor: isDark ? '#1D1D1F' : '#FAFAF7',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        boxShadow: 'none',
      }}
    >
      <div
        className={`relative z-10 flex flex-col ${
          integratedArt ? 'pb-[11.5rem] sm:pb-[13rem] lg:pb-[14rem]' : 'h-full justify-between'
        }`}
      >
        <div className={integratedArt ? 'max-w-xl' : undefined}>
          <h3
            className={`text-balance font-semibold leading-[0.95] tracking-tight ${headlineTextClass(card.size)}`}
            style={{ color: card.accent ?? (isDark ? '#FFFFFF' : '#111111') }}
          >
            {card.title}
          </h3>

          {card.body && bodyHeadline ? (
            <p
              className={`mt-2 text-balance font-semibold leading-[0.98] tracking-tight ${headlineTextClass(card.size)} ${hasArtwork ? 'max-w-[30rem]' : 'max-w-none'}`}
              style={{ color: isDark ? '#FFFFFF' : '#111111' }}
            >
              {card.body}
            </p>
          ) : null}

          {card.body && !bodyHeadline ? (
            <p
              className={`mt-4 text-base leading-7 sm:text-lg ${hasArtwork ? 'max-w-[30rem]' : 'max-w-none'}`}
              style={{ color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(17,17,17,0.68)' }}
            >
              {card.body}
            </p>
          ) : null}

          {!card.body ? (
            <div
              className="mt-4 h-px w-16"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,17,17,0.12)' }}
            />
          ) : null}
        </div>

        {!integratedArt ? <PremiumStaticCardArtwork card={card} index={index} /> : null}
      </div>

      {integratedArt ? <PremiumStaticCardArtwork card={card} index={index} /> : null}
    </motion.article>
  );
}

function PremiumSection({
  section,
}: {
  section: PremiumStaticSection;
}) {
  const tarif = section.tarifLayout;

  if (tarif) {
    /** Disque blanc, coche même vert que le fond de section. */
    const checkFill = '#FFFFFF';
    const checkStroke = section.background;

    const priceEl = (
      <p className="m-0 shrink-0 font-semibold leading-none tracking-[-0.04em] text-white">
        <span className="inline-block text-[clamp(2.75rem,9vw,6.25rem)] leading-none">{tarif.priceInteger}</span>
        <span className="ml-1 inline-block align-baseline text-[clamp(1.35rem,3.5vw,2.75rem)] leading-none">
          {tarif.priceCurrency}
        </span>
      </p>
    );

    return (
      <section
        id={section.id}
        data-premium-static-section
        className="relative flex min-h-[120svh] items-start px-6 pb-20 pt-14 sm:px-10 sm:pb-24 sm:pt-16 lg:px-16 lg:pb-28 lg:pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <h2 className="max-w-[14ch] text-balance text-[2.85rem] font-semibold leading-[0.94] tracking-[-0.03em] sm:text-[4.25rem] lg:text-[clamp(3.5rem,6.5vw,5.75rem)]">
            <span className="block" style={{ color: section.titleTopColor ?? '#FFFFFF' }}>
              {section.titleTop}
            </span>
            <span
              className="block"
              style={{ color: section.titleBottomColor ?? 'rgba(17,17,17,0.62)' }}
            >
              {section.titleBottom}
            </span>
          </h2>

          <div className="mt-8 grid gap-5 sm:mt-9 sm:gap-6 lg:mt-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-12 lg:gap-y-5">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{tarif.offerHeading}</h3>
              <ul className="mt-6 max-w-xl space-y-4 sm:mt-7">
                {tarif.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <circle cx="10" cy="10" r="10" fill={checkFill} />
                      <path
                        d="M6 10.5l2.5 2.5 5.5-5.5"
                        stroke={checkStroke}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[0.95rem] leading-snug text-white/[0.88] sm:text-base sm:leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-row items-end justify-between gap-4 lg:col-start-1 lg:row-start-2 lg:justify-start">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
                <Link
                  href={tarif.primaryCta.href}
                  className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-black transition-colors duration-300 hover:bg-[#F2F2F2]"
                >
                  {tarif.primaryCta.label}
                </Link>
                <Link
                  href={tarif.secondaryCta.href}
                  className="inline-flex h-14 items-center justify-center rounded-full border border-white/[0.35] px-7 text-base font-semibold text-white transition-colors hover:bg-white/[0.1]"
                >
                  {tarif.secondaryCta.label}
                </Link>
              </div>
              <div className="self-end lg:hidden">{priceEl}</div>
            </div>

            <div className="hidden lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:flex lg:flex-col lg:items-end lg:justify-end lg:text-right">
              {priceEl}
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      id={section.id}
      data-premium-static-section
      className="relative flex min-h-[120svh] items-center px-4 py-20 sm:px-6 sm:py-24 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-balance text-[3.35rem] font-semibold leading-[0.92] tracking-tight sm:text-[4.8rem] lg:text-[6rem]">
            <span style={{ color: section.titleTopColor ?? '#FFFFFF' }}>{section.titleTop}</span>
            <br />
            <span style={{ color: section.titleBottomColor ?? 'rgba(17,17,17,0.62)' }}>
              {section.titleBottom}
            </span>
          </h2>

          {section.description ? (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[rgba(17,17,17,0.68)] sm:text-lg">
              {section.description}
            </p>
          ) : null}
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-12 lg:mt-16 lg:gap-6">
          {section.cards.map((card, index) => (
            <PremiumCard
              key={`${section.id}-${index}`}
              card={card}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PremiumStaticPageExperience({
  page,
}: PremiumStaticPageExperienceProps) {
  const reduceMotion = useReducedMotion();
  const [activeSectionId, setActiveSectionId] = useState(page.sections[0]?.id ?? '');
  const ratiosRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const sections = page.sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

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

        const active = page.sections
          .map((section) => ({
            id: section.id,
            ratio: ratiosRef.current[section.id] ?? 0,
          }))
          .sort((left, right) => right.ratio - left.ratio)[0];

        if (active && active.ratio > 0.1) {
          setActiveSectionId(active.id);
        }
      },
      {
        threshold: [0.08, 0.16, 0.24, 0.36, 0.48, 0.6],
        rootMargin: '-20% 0px -20% 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [page.sections]);

  const activeSection =
    page.sections.find((section) => section.id === activeSectionId) ?? page.sections[0];

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
            {page.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#5C5C64] sm:text-lg">
            {page.hero.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={page.hero.primaryHref}
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#000000] sm:text-base"
            >
              {page.hero.primaryLabel}
            </Link>
            <Link
              href={page.hero.secondaryHref}
              className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 bg-white px-7 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F5F5F7] sm:text-base"
            >
              {page.hero.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative cv-auto">
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ backgroundColor: activeSection?.background ?? '#ffffff' }}
          transition={{
            duration: reduceMotion ? 0 : 2.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <div className="relative z-10">
          {page.sections.map((section) => (
            <PremiumSection key={section.id} section={section} />
          ))}

          {page.finalFaq ? (
            <PremiumFinalFaqBlock faq={page.finalFaq} />
          ) : page.finalCta ? (
            <section className="relative cv-auto px-4 pb-20 pt-8 sm:px-6 sm:pb-24 md:pb-28">
              <div className="mx-auto max-w-5xl rounded-[38px] border border-black/8 bg-white px-6 py-10 sm:px-10 sm:py-12">
                <div className="text-center">
                  <h2 className="text-balance text-[2.7rem] font-semibold leading-[0.94] tracking-tight text-[#111111] sm:text-[4rem]">
                    {page.finalCta.title}
                  </h2>
                  <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5C5C64] sm:text-lg">
                    {page.finalCta.body}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href={page.finalCta.primaryHref}
                      className="inline-flex h-14 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#000000] sm:text-base"
                    >
                      {page.finalCta.primaryLabel}
                    </Link>
                    <Link
                      href={page.finalCta.secondaryHref}
                      className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 bg-[#F5F5F7] px-7 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#ECECF1] sm:text-base"
                    >
                      {page.finalCta.secondaryLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}
