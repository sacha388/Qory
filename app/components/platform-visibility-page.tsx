import Link from 'next/link';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { getSiteUrl } from '@/app/lib/site-url';
import ResourceArticleFaq from '@/app/components/resource-article-faq';
import {
  platformVisibilityDefaultIllustrations,
  platformVisibilityInternalLinks,
  type PlatformVisibilityPageData,
} from '@/app/lib/platform-visibility-pages-content';
import SecondaryPageShell from '@/app/components/secondary-page-shell';

type PlatformVisibilityPageProps = {
  content: PlatformVisibilityPageData;
  naturalScrollLayout?: boolean;
};

/** Bloc couleur + pictogramme SVG blanc pour « Pourquoi cette plateforme compte ». */
const WHY_PLATFORM_VISUAL: Record<
  PlatformVisibilityPageData['id'],
  { background: string; iconSrc: string }
> = {
  chatgpt: { background: '#000000', iconSrc: '/openai.svg' },
  claude: { background: '#C15F3C', iconSrc: '/claude.svg' },
  perplexity: { background: '#20808D', iconSrc: '/perplexity.svg' },
};

const SECTION_WHY_MEASURE = 'Pourquoi mesurer avant de corriger';
const SECTION_QORY_ANALYSES = 'Ce que Qory analyse pour cette plateforme';
const SECTION_WHY_ABSENT = 'Pourquoi un site peut être absent';
const SECTION_FREINS = 'Les freins les plus fréquents';

/** Grosse croix rouge épaisse (absence / blocage). */
function AbsentSiteThickCross() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-44 w-44 shrink-0 sm:h-52 sm:w-52 md:h-60 md:w-60 lg:h-[16.5rem] lg:w-[16.5rem]"
      aria-hidden
    >
      <line
        x1="14"
        y1="14"
        x2="86"
        y2="86"
        stroke="#DC2626"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <line
        x1="86"
        y1="14"
        x2="14"
        y2="86"
        stroke="#DC2626"
        strokeWidth="15"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Triangle d’avertissement jaune + « ! » blanc (vrai triangle, pas un disque). */
function FrequentBlockersWarningIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-44 w-44 shrink-0 sm:h-52 sm:w-52 md:h-60 md:w-60 lg:h-[16.5rem] lg:w-[16.5rem]"
      aria-hidden
    >
      <path
        fill="#F59E0B"
        stroke="#F59E0B"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M50 12 L89 86 H11 Z"
      />
      <rect x="45.5" y="34" width="9" height="26" rx="4.5" fill="#FFFFFF" />
      <circle cx="50" cy="74.5" r="5.5" fill="#FFFFFF" />
    </svg>
  );
}

/** Quatre cercles (couleurs des « Quatre lectures » landing), grille 2×2. */
function QoryAnalysisLandingShapes() {
  const colors = ['#4BA7F5', '#69D33F', '#F16B5D', '#F4B43A'] as const;

  return (
    <div
      className="mx-auto grid w-full max-w-[20rem] grid-cols-2 gap-8 place-items-center sm:max-w-[24rem] sm:gap-10 md:max-w-[28rem] md:gap-12"
      aria-hidden
    >
      {colors.map((color) => (
        <div
          key={color}
          className="h-28 w-28 shrink-0 rounded-full sm:h-32 sm:w-32 md:h-40 md:w-40"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

/** Histogramme minimal (barres arrondies), sans axe ni contour — couleur = marque plateforme. */
function MeasureBeforeFixBars({ fill }: { fill: string }) {
  const barW = 42;
  const gap = 28;
  const padX = 12;
  const vbH = 132;
  const baseY = 118;
  /** Quatre hauteurs toutes différentes, sans paires « deux hauts / deux bas » identiques. */
  const heights = [104, 46, 88, 63];
  const cornerR = 9;
  const vbW = padX * 2 + 4 * barW + 3 * gap;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="mx-auto h-52 w-full max-w-[20rem] sm:h-60 sm:max-w-[24rem] md:h-[18.5rem] md:max-w-[26rem]"
      aria-hidden
    >
      {heights.map((h, i) => {
        const r = Math.min(cornerR, h / 2 - 0.5);
        return (
          <rect
            key={i}
            x={padX + i * (barW + gap)}
            y={baseY - h}
            width={barW}
            height={h}
            rx={r}
            ry={r}
            fill={fill}
          />
        );
      })}
    </svg>
  );
}

export default function PlatformVisibilityPage({
  content,
  naturalScrollLayout = false,
}: PlatformVisibilityPageProps) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${content.path}`;
  const heroSectionClassName = naturalScrollLayout
    ? 'relative flex flex-col items-center justify-center bg-white px-0 pb-14 pt-[5.25rem] sm:pb-16 sm:pt-24 md:pb-20 md:pt-28'
    : 'relative flex min-h-svh flex-col items-center justify-center bg-white px-0 pb-[5.25rem] pt-[5.25rem] sm:pb-24 sm:pt-24 md:pb-28 md:pt-28';
  const finalCtaSectionClassName = naturalScrollLayout
    ? 'relative bg-black'
    : 'relative min-h-[100svh] bg-black';
  const finalCtaInnerClassName = naturalScrollLayout
    ? 'flex flex-col items-center justify-center px-6 py-20 sm:px-10 sm:py-24 lg:px-16'
    : 'flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 sm:px-10 lg:px-16';

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: content.headline,
    description: content.seoDescription,
    url: pageUrl,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Qory',
      url: siteUrl,
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const allResourceLinks = [...platformVisibilityInternalLinks, content.useCaseLink];

  function sectionIllustration(index: number, override?: string) {
    return (
      override ??
      platformVisibilityDefaultIllustrations[index % platformVisibilityDefaultIllustrations.length]
    );
  }

  const finalCtaSection = (
    <section className={finalCtaSectionClassName} aria-label="Appel à l’action">
      <div className={finalCtaInnerClassName}>
        <div className="mx-auto w-full max-w-5xl text-center">
          <h2 className="text-balance text-[2.85rem] font-semibold leading-[0.94] tracking-tight text-white sm:text-[4.25rem] lg:text-[5.1rem]">
            {content.finalCtaTitle}
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/75 sm:mt-10 sm:text-lg">
            {content.finalCtaBody}
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:mt-14">
            <Link
              href={content.ctaHref}
              className="inline-flex h-[52px] min-w-[10.5rem] items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-black transition-colors hover:bg-[#F2F2F2] sm:h-14 sm:px-9 sm:text-lg"
            >
              {content.finalCtaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <SecondaryPageShell
      fullViewportTop={!naturalScrollLayout}
      contentPaddingClassName="pt-10 pb-0 sm:pt-12 sm:pb-0 md:pt-14 md:pb-0"
      topContentBottomPaddingClassName="pb-0"
      fullBleedBottom={finalCtaSection}
      topContent={
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
          <section className={heroSectionClassName}>
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center sm:px-6">
              <img
                src={content.heroImageSrc}
                alt={content.heroImageAlt}
                width={512}
                height={512}
                className="h-40 w-40 object-contain sm:h-52 sm:w-52 md:h-64 md:w-64 lg:h-72 lg:w-72"
                draggable={false}
              />
              <h1 className="mt-8 max-w-4xl text-balance text-[2.35rem] font-semibold leading-[0.95] tracking-tight text-[#111111] sm:text-[3.25rem] lg:text-[3.85rem]">
                {content.headline}
              </h1>
              <Link
                href={content.ctaHref}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A1A1A] sm:px-8 sm:text-base"
              >
                {content.ctaLabel}
              </Link>
            </div>
          </section>
        </>
      }
    >
      <div>
        {content.sections.map((section, index) => {
          const illustrationSrc = sectionIllustration(index, section.illustrationSrc);
          const imageOnLeft = index % 2 === 0;
          const isWhyMeasureSection = section.title === SECTION_WHY_MEASURE;
          const isWhyPlatformSection = section.title === 'Pourquoi cette plateforme compte';
          const isQoryAnalysisSection = section.title === SECTION_QORY_ANALYSES;
          const isWhyAbsentSection = section.title === SECTION_WHY_ABSENT;
          const isFreinsSection = section.title === SECTION_FREINS;
          const brandVisual = isWhyPlatformSection ? WHY_PLATFORM_VISUAL[content.id] : null;
          const measureBarColor = WHY_PLATFORM_VISUAL[content.id].background;

          return (
            <section
              key={section.title}
              className="border-t border-black/[0.06] bg-white first:border-t-0 cv-auto"
            >
              <div className="grid gap-12 py-14 sm:gap-14 sm:py-16 md:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div
                  className={
                    imageOnLeft
                      ? 'order-1 flex items-center justify-center'
                      : 'order-1 flex items-center justify-center lg:order-2'
                  }
                >
                  <div className="w-full max-w-[min(100%,20rem)] sm:max-w-md">
                    {brandVisual ? (
                      <div
                        className="flex aspect-square items-center justify-center rounded-[1.75rem] sm:rounded-[2rem]"
                        style={{ backgroundColor: brandVisual.background }}
                      >
                        <img
                          src={brandVisual.iconSrc}
                          alt=""
                          className="h-20 w-20 object-contain brightness-0 invert sm:h-24 sm:w-24 md:h-28 md:w-28"
                          draggable={false}
                        />
                      </div>
                    ) : isWhyMeasureSection ? (
                      <div className="flex min-h-[18rem] items-center justify-center sm:min-h-[21rem] md:min-h-[23rem]">
                        <MeasureBeforeFixBars fill={measureBarColor} />
                      </div>
                    ) : isQoryAnalysisSection ? (
                      <div className="flex min-h-[18rem] items-center justify-center py-4 sm:min-h-[22rem] sm:py-6 md:min-h-[26rem]">
                        <QoryAnalysisLandingShapes />
                      </div>
                    ) : isWhyAbsentSection ? (
                      <div className="flex min-h-[16rem] items-center justify-center sm:min-h-[18rem] md:min-h-[20rem]">
                        <AbsentSiteThickCross />
                      </div>
                    ) : isFreinsSection ? (
                      <div className="flex min-h-[16rem] items-center justify-center sm:min-h-[18rem] md:min-h-[20rem]">
                        <FrequentBlockersWarningIcon />
                      </div>
                    ) : (
                      <div className="rounded-[1.75rem] border border-black/[0.06] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:rounded-[2rem] sm:p-8">
                        <img
                          src={illustrationSrc}
                          alt=""
                          className="h-auto w-full object-contain"
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={
                    imageOnLeft
                      ? 'order-2 flex flex-col justify-center lg:pl-4'
                      : 'order-2 flex flex-col justify-center lg:order-1 lg:pr-4'
                  }
                >
                  <h2 className="text-balance text-[1.65rem] font-semibold leading-[1.05] tracking-tight text-[#111111] sm:text-[2rem] sm:leading-[1.08]">
                    {section.title}
                  </h2>
                  {section.paragraphs.length > 0 ? (
                    <div className="mt-5 space-y-4 sm:mt-6">
                      {section.paragraphs.map((paragraph, pIndex) => (
                        <p
                          key={`${section.title}-p-${pIndex}`}
                          className="max-w-xl text-base leading-[1.75] text-[#5C5C64] sm:text-lg sm:leading-8"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className="mt-5 max-w-xl space-y-3 text-[#5C5C64] sm:mt-6">
                      {section.bullets.map((bullet, bIndex) => (
                        <li key={`${section.title}-b-${bIndex}`} className="flex items-start gap-3 text-base leading-relaxed sm:text-lg">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4BA7F5]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}

        <section className="border-t border-black/[0.06] py-14 sm:py-16 md:py-20 cv-auto">
          <h2 className="text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">Pour aller plus loin</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#5C5C64] sm:text-base">
            Ressources utiles autour de la visibilité IA et de l’offre Qory.
          </p>
          <nav className="mt-8 flex flex-col gap-x-10 gap-y-4 sm:flex-row sm:flex-wrap">
            {allResourceLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="group inline-flex w-fit text-sm font-semibold text-[#111111] sm:text-base"
              >
                <span className="underline decoration-black/20 underline-offset-[0.22em] transition-colors [text-decoration-skip-ink:none] group-hover:decoration-black/50">
                  {link.label}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={14}
                    strokeWidth={1.35}
                    className="ml-1 inline-block align-[-0.12em] text-current"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="w-full border-t border-black/[0.08] pt-12 sm:pt-14 pb-10 sm:pb-12 md:pb-14 cv-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[2rem]">FAQ</h2>
          <ResourceArticleFaq items={content.faqs} />
        </section>
      </div>
    </SecondaryPageShell>
  );
}
