'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiSearchIcon, File01Icon, Globe02Icon } from '@hugeicons/core-free-icons';
import PremiumFinalFaqBlock, {
  PREMIUM_TARIFS_FAQ_HEADLINE_COMPACT_CLASSNAME,
} from '@/app/components/premium-final-faq-block';
import CommentCaMarcheReportPreviewModal from '@/app/components/comment-ca-marche-report-preview-modal';
import SiteFooter from '@/app/components/site-footer';
import SiteHeader from '@/app/components/site-header';
import { HowItWorksFigure } from '@/app/components/comment-ca-marche-how-it-works-figures';
import type { PremiumHowItWorksIcon, PremiumStaticPageData } from '@/app/lib/premium-static-pages-content';

const HOW_IT_WORKS_HUGEICONS = {
  url: Globe02Icon,
  analysis: AiSearchIcon,
  report: File01Icon,
} as const;

type CommentCaMarcheExperienceProps = {
  page: PremiumStaticPageData;
};

function BlockIcon({ icon }: { icon: PremiumHowItWorksIcon }) {
  return (
    <HugeiconsIcon
      icon={HOW_IT_WORKS_HUGEICONS[icon]}
      size={72}
      strokeWidth={1.35}
      className="h-[3.25rem] w-[3.25rem] shrink-0 text-[#1D1D1F] sm:h-16 sm:w-16 md:h-[4.25rem] md:w-[4.25rem]"
      aria-hidden
    />
  );
}

export default function CommentCaMarcheExperience({ page }: CommentCaMarcheExperienceProps) {
  const blocks = page.howItWorksBlocks ?? [];
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-white">
      <SiteHeader variant="dark" position="fixed" landingMinimal />

      <div className="relative flex min-h-[min(62svh,32rem)] flex-col bg-[#121418] pt-16 pb-12 sm:min-h-[min(68svh,36rem)] sm:pb-16 md:min-h-[min(72svh,40rem)] md:pt-[72px] md:pb-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-white/[0.06] sm:h-72 sm:w-72" />
          <div className="absolute -right-16 bottom-4 h-44 w-44 rounded-full bg-black/35 sm:h-64 sm:w-64" />
          <div className="absolute right-1/4 top-1/3 h-24 w-24 rounded-2xl bg-white/[0.05] sm:h-32 sm:w-32" />
        </div>
        <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-3 text-center sm:px-5 md:px-8">
          <h1 className="max-w-[100vw] whitespace-nowrap text-center text-[clamp(1.55rem,4.2vw+0.6rem,4.85rem)] font-semibold leading-[0.92] tracking-[-0.02em] text-white sm:text-[clamp(2rem,3.8vw+1rem,4.35rem)] md:text-[4.35rem] lg:text-[4.85rem]">
            {page.title}
          </h1>
        </div>
      </div>

      <div className="bg-white cv-auto">
        {blocks.map((block, index) => (
          <motion.section
            key={`${block.title}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-black/[0.06] first:border-t-0"
          >
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-16 md:py-20 lg:gap-20">
              <div className="min-w-0 md:pr-4">
                <BlockIcon icon={block.icon} />
                <h2 className="mt-6 max-w-xl text-balance text-[1.85rem] font-semibold leading-[1.08] tracking-tight text-[#111111] sm:mt-7 sm:text-[2.15rem] md:text-[2.35rem]">
                  {block.title}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5C5C64] sm:text-lg sm:leading-relaxed">
                  {block.body}
                </p>
                {block.visual === 'rapport' ? (
                  <button
                    type="button"
                    onClick={() => setReportPreviewOpen(true)}
                    className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#000000] sm:h-14 sm:px-7 sm:text-base"
                  >
                    Voir l’aperçu
                  </button>
                ) : null}
              </div>
              <HowItWorksFigure visual={block.visual} />
            </div>
          </motion.section>
        ))}
      </div>

      {page.finalCta ? (
        <section className="relative bg-white px-4 pb-6 pt-2 sm:px-6 sm:pb-8 md:pb-10 cv-auto">
          <div className="mx-auto max-w-5xl rounded-[38px] border border-black/8 bg-white px-6 py-10 sm:px-10 sm:py-12">
            <div className="text-center">
              <h2 className="text-balance text-[2.05rem] font-semibold leading-[0.95] tracking-tight text-[#111111] sm:text-[2.8rem] md:text-[3.15rem]">
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

      {page.finalFaq ? (
        <PremiumFinalFaqBlock
          faq={page.finalFaq}
          faqTitleClassName={PREMIUM_TARIFS_FAQ_HEADLINE_COMPACT_CLASSNAME}
          compactItems
        />
      ) : null}

      <CommentCaMarcheReportPreviewModal
        open={reportPreviewOpen}
        onClose={() => setReportPreviewOpen(false)}
      />

      <SiteFooter className="relative mt-0 rounded-none bg-[#121418] px-4 pb-10 pt-12 text-white sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16" />
    </main>
  );
}
