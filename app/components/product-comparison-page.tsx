import Link from 'next/link';
import SecondaryPageShell from '@/app/components/secondary-page-shell';
import type { ComparisonPageData } from '@/app/lib/comparison-pages-content';

type ProductComparisonPageProps = {
  content: ComparisonPageData;
  /** Résumé mis en avant (ex. une phrase plus grande pour Otterly). */
  summaryProminent?: boolean;
};

export default function ProductComparisonPage({ content, summaryProminent = false }: ProductComparisonPageProps) {
  const finalCtaSection = (
    <section className="relative min-h-[100svh] bg-black cv-auto" aria-label="Appel à l’action">
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h2 className="text-balance text-[2.85rem] font-semibold leading-[0.94] tracking-tight text-white sm:text-[4.25rem] lg:text-[5.1rem]">
            {content.finalCta.title}
          </h2>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:mt-14">
            <Link
              href={content.finalCta.ctaHref}
              className="inline-flex h-[52px] min-w-[10.5rem] items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2] sm:h-14 sm:px-9 sm:text-lg"
            >
              {content.finalCta.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <SecondaryPageShell
      fullViewportTop
      contentPaddingClassName="pt-10 pb-0 sm:pt-12 sm:pb-0 md:pt-14 md:pb-0"
      topContentBottomPaddingClassName="pb-0"
      fullBleedBottom={finalCtaSection}
      topContent={
        <section className="relative flex min-h-svh flex-col items-center justify-center bg-white pb-[5.25rem] pt-[5.25rem] sm:pb-24 sm:pt-24 md:pb-28 md:pt-28">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <img
              src="/logo.svg"
              alt="Qory"
              className="mx-auto mb-8 h-[4.75rem] w-[4.75rem] sm:h-[5.4rem] sm:w-[5.4rem]"
              draggable={false}
            />
            <h1 className="max-w-5xl text-balance text-[3.25rem] font-semibold leading-[0.92] tracking-tight text-[#111111] sm:text-[4.9rem] lg:text-[6.25rem]">
              {content.hero.headline}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#5C5C64] sm:text-lg">{content.hero.subline}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={content.hero.ctaHref}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#000000] sm:text-base"
              >
                {content.hero.ctaLabel}
              </Link>
            </div>
          </div>
        </section>
      }
    >
      <div className="pb-10 sm:pb-12 md:pb-14 cv-auto">
        <section className="border-t border-black/[0.06] bg-white py-14 first:border-t-0 sm:py-16 md:py-20 cv-auto">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-balance text-[1.65rem] font-semibold leading-[1.05] tracking-tight text-[#111111] sm:text-[2rem] sm:leading-[1.08]">
              {content.summaryHeading}
            </h2>
            <div
              className={`mt-5 space-y-4 sm:mt-6 ${summaryProminent ? 'text-lg leading-relaxed text-[#111111] sm:text-xl sm:leading-8' : ''}`}
            >
              {content.summaryParagraphs.map((p, i) => (
                <p
                  key={`summary-${i}`}
                  className={
                    summaryProminent
                      ? 'font-medium text-[#1D1D1F]'
                      : 'text-base leading-[1.75] text-[#5C5C64] sm:text-lg sm:leading-8'
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/[0.06] bg-white py-14 sm:py-16 md:py-20 cv-auto">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-balance text-[1.65rem] font-semibold leading-[1.05] tracking-tight text-[#111111] sm:text-[2rem] sm:leading-[1.08]">
              {content.tableHeading}
            </h2>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-black/[0.08] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm sm:min-w-0 sm:text-base">
                <thead>
                  <tr className="border-b border-black/[0.08] bg-[#FAFAF7]">
                    <th scope="col" className="px-4 py-3.5 font-semibold text-[#111111] sm:px-5 sm:py-4">
                      Critère
                    </th>
                    <th scope="col" className="px-4 py-3.5 font-semibold text-[#111111] sm:px-5 sm:py-4">
                      Qory
                    </th>
                    <th scope="col" className="px-4 py-3.5 font-semibold text-[#111111] sm:px-5 sm:py-4">
                      {content.competitorShortName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {content.tableRows.map((row) => (
                    <tr key={row.criterion} className="border-b border-black/[0.06] last:border-b-0">
                      <th
                        scope="row"
                        className="px-4 py-3.5 align-top font-semibold text-[#111111] sm:px-5 sm:py-4"
                      >
                        {row.criterion}
                      </th>
                      <td className="px-4 py-3.5 align-top leading-relaxed text-[#5C5C64] sm:px-5 sm:py-4">
                        {row.qory}
                      </td>
                      <td className="px-4 py-3.5 align-top leading-relaxed text-[#5C5C64] sm:px-5 sm:py-4">
                        {row.competitor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {content.sections.map((section) => {
          const paragraphs = section.paragraphs ?? [];
          return (
            <section
              key={section.id}
              className="border-t border-black/[0.06] bg-white py-14 sm:py-16 md:py-20 cv-auto"
            >
              <div className="mx-auto max-w-3xl">
                <h2 className="text-balance text-[1.65rem] font-semibold leading-[1.05] tracking-tight text-[#111111] sm:text-[2rem] sm:leading-[1.08]">
                  {section.title}
                </h2>
                {paragraphs.length > 0 ? (
                  <div className="mt-5 space-y-4 sm:mt-6">
                    {paragraphs.map((paragraph, pIndex) => (
                      <p
                        key={`${section.id}-p-${pIndex}`}
                        className="text-base leading-[1.75] text-[#5C5C64] sm:text-lg sm:leading-8"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-5 space-y-3 text-[#5C5C64] sm:mt-6">
                    {section.bullets.map((bullet, bIndex) => (
                      <li
                        key={`${section.id}-b-${bIndex}`}
                        className="flex items-start gap-3 text-base leading-relaxed sm:text-lg"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4BA7F5]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </SecondaryPageShell>
  );
}
