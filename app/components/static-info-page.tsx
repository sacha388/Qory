import { getSiteUrl } from '@/app/lib/site-url';
import Link from 'next/link';
import SecondaryPageHero from '@/app/components/secondary-page-hero';
import SecondaryPageShell from '@/app/components/secondary-page-shell';

type StaticSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type StaticInfoPageProps = {
  title: string;
  intro: string[];
  sections: StaticSection[];
  /** Conservé pour compatibilité SEO / pages ; non affiché (hero à la place du fil d’Ariane). */
  breadcrumbLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerText?: string;
  seoPath: string;
  seoDescription: string;
};

export default function StaticInfoPage({
  title,
  intro,
  sections,
  breadcrumbLabel: _breadcrumbLabel,
  ctaLabel,
  ctaHref = '/',
  footerText,
  seoPath,
  seoDescription,
}: StaticInfoPageProps) {
  const siteUrl = getSiteUrl();
  const pageUrl = seoPath === '/' ? siteUrl : `${siteUrl}${seoPath}`;
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: seoDescription,
    url: pageUrl,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Qory',
      url: siteUrl,
    },
  };

  function getDisplaySectionTitle(sectionTitle: string): string {
    return sectionTitle.replace(/^(\d+\.)+\s*/, '').trim();
  }

  const heroDescription = intro.filter(Boolean).join(' ');

  return (
    <SecondaryPageShell
      fullViewportTop
      topContentBottomPaddingClassName="pb-0"
      topContent={
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
          />
          <SecondaryPageHero title={title} description={heroDescription} />
        </>
      }
    >
      <section className="border-t border-black/[0.08] pt-10 sm:pt-12 md:pt-14 cv-auto">
        <div className="rounded-[28px] bg-[#F5F5F7] p-5 sm:p-7 md:p-9">
          <div className="space-y-7 sm:space-y-9">
            {sections.map((section, index) => {
              const displayTitle = getDisplaySectionTitle(section.title);

              return (
                <article
                  key={index}
                  className={index > 0 ? 'border-t border-black/[0.06] pt-6 sm:pt-8 cv-auto' : 'cv-auto'}
                >
                  {displayTitle ? (
                    <h2 className="text-xl font-semibold text-[#1D1D1F] sm:text-2xl">
                      {displayTitle}
                    </h2>
                  ) : null}

                  {section.paragraphs && section.paragraphs.length > 0 ? (
                    <div className={`${displayTitle ? 'mt-4' : ''} space-y-4`}>
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex} className="leading-relaxed text-[#5C5C64]">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className={`${section.paragraphs && section.paragraphs.length > 0 ? 'mt-4' : displayTitle ? 'mt-4' : ''} space-y-2 text-[#5C5C64]`}>
                      {section.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        {(ctaLabel || footerText) && (
          <div className="mt-8 border-t border-black/[0.06] pt-6 sm:mt-12 sm:pt-8 cv-auto">
            {ctaLabel ? (
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1A1A1A] sm:px-6 sm:text-base"
              >
                {ctaLabel}
              </Link>
            ) : (
              <p className="text-sm text-[#5C5C64] sm:text-base">
                {footerText}
              </p>
            )}
          </div>
        )}
      </section>
    </SecondaryPageShell>
  );
}
