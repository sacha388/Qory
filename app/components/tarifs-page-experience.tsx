'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PremiumFinalFaqBlock, {
  PREMIUM_TARIFS_FAQ_HEADLINE_COMPACT_CLASSNAME,
  PREMIUM_TARIFS_GREEN_BAND_H1_CLASSNAME,
} from '@/app/components/premium-final-faq-block';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import { REPORT_DECO_GREEN } from '@/app/components/title-deco';
import type { PremiumStaticPageData } from '@/app/lib/premium-static-pages-content';

type TarifsPageExperienceProps = {
  page: PremiumStaticPageData;
};

export default function TarifsPageExperience({ page }: TarifsPageExperienceProps) {
  const band = page.tarifsBand;
  const models = page.modelsStrip;
  const pricingSection = page.sections[0];
  const tarif = pricingSection?.tarifLayout;

  if (!band || !models || !tarif || !pricingSection) {
    return null;
  }

  const checkFill = REPORT_DECO_GREEN;
  const checkStroke = '#FFFFFF';

  /** Même valeur que le `-mt` de la carte : zone non prise en compte pour centrer le titre (entre header et bord haut de la carte). */
  const pricingCardOverlapClassName = 'h-[clamp(4.5rem,14vw,9rem)] sm:h-[clamp(5.5rem,16vw,10.5rem)]';

  const priceEl = (
    <p className="m-0 shrink-0 font-semibold leading-none tracking-[-0.04em] text-[#1D1D1F]">
      <span className="inline-block text-[clamp(2.75rem,9vw,6.25rem)] leading-none">{tarif.priceInteger}</span>
      <span className="ml-1 inline-block align-baseline text-[clamp(1.35rem,3.5vw,2.75rem)] leading-none">
        {tarif.priceCurrency}
      </span>
    </p>
  );

  return (
    <main className="relative min-h-screen overflow-x-clip bg-white">
      <SiteHeader variant="dark" position="fixed" landingMinimal />

      <div className="relative">
        <div className="relative grid min-h-[48svh] grid-rows-[minmax(0,1fr)_auto] bg-[#65CB45] pt-16 sm:min-h-[52svh] md:min-h-[54svh] md:pt-[72px]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-white/[0.12] sm:h-72 sm:w-72" />
            <div className="absolute -right-16 bottom-4 h-44 w-44 rounded-full bg-black/[0.06] sm:h-64 sm:w-64" />
            <div className="absolute right-1/4 top-1/3 h-24 w-24 rounded-2xl bg-white/[0.08] sm:h-32 sm:w-32" />
          </div>

          <div className="relative z-[1] mx-auto flex min-h-0 w-full max-w-4xl flex-col items-center justify-center px-6 text-center sm:px-10">
            <h1 className={PREMIUM_TARIFS_GREEN_BAND_H1_CLASSNAME}>{band.title}</h1>
            {band.subtitle ? (
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/[0.9] sm:text-lg">
                {band.subtitle}
              </p>
            ) : null}
          </div>

          <div className={`relative z-[1] shrink-0 ${pricingCardOverlapClassName}`} aria-hidden />
        </div>

        <div className="relative z-[2] -mt-[clamp(4.5rem,14vw,9rem)] px-6 pb-8 sm:-mt-[clamp(5.5rem,16vw,10.5rem)] sm:px-10 sm:pb-10 lg:px-16 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-5xl rounded-[32px] bg-white px-6 py-9 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.14)] sm:px-10 sm:py-10 md:px-14 md:py-12"
          >
            <h2 className="max-w-[20ch] text-balance text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[#111111] sm:text-[1.85rem] md:text-[2rem]">
              <span className="block" style={{ color: pricingSection.titleTopColor ?? '#111111' }}>
                {pricingSection.titleTop}
              </span>
              {pricingSection.titleBottom.trim() ? (
                <span
                  className="mt-1 block text-[0.92em] font-semibold"
                  style={{ color: pricingSection.titleBottomColor ?? 'rgba(17,17,17,0.62)' }}
                >
                  {pricingSection.titleBottom}
                </span>
              ) : null}
            </h2>

            <div className="mt-6 grid gap-5 sm:mt-7 sm:gap-6 lg:mt-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-12 lg:gap-y-5">
              <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                <h3 className="text-lg font-semibold tracking-tight text-[#1D1D1F] sm:text-xl">{tarif.offerHeading}</h3>
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
                      <span className="text-[0.95rem] leading-snug text-[#4A4A52] sm:text-base sm:leading-relaxed">
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
                    className="inline-flex h-14 items-center justify-center rounded-full bg-black px-7 text-base font-semibold text-white transition-colors duration-300 hover:bg-[#1A1A1A]"
                  >
                    {tarif.primaryCta.label}
                  </Link>
                  <Link
                    href={tarif.secondaryCta.href}
                    className="inline-flex h-14 items-center justify-center rounded-full border border-black/[0.12] px-7 text-base font-semibold text-[#1D1D1F] transition-colors hover:bg-black/[0.04]"
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
        </div>
      </div>

      <section className="bg-white px-6 pb-14 pt-4 sm:px-10 sm:pb-16 sm:pt-5 lg:px-16 cv-auto" aria-label="Modèles analysés">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-balance text-center text-[1.05rem] font-medium leading-snug tracking-tight text-[#6E6E73] sm:text-lg md:text-xl">
            {models.title}
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:mt-10 sm:gap-x-11 md:gap-x-14">
            {models.items.map((item) => (
              <div
                key={item.name}
                className="flex h-8 shrink-0 items-center justify-center sm:h-9"
              >
                <img
                  src={item.logoSrc}
                  alt={item.name}
                  draggable={false}
                  className="block h-full w-auto max-h-full max-w-none shrink-0 object-contain object-center brightness-0 opacity-90"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          <div className="mt-10 w-full border-b border-black/[0.1] sm:mt-12" aria-hidden />
        </div>
      </section>

      {page.finalFaq ? (
        <PremiumFinalFaqBlock
          faq={page.finalFaq}
          faqTitleClassName={PREMIUM_TARIFS_FAQ_HEADLINE_COMPACT_CLASSNAME}
          compactItems
        />
      ) : null}

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}
