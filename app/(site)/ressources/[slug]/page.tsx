import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResourceArticleBlocks, { expandResourceSectionBlocks } from '@/app/components/resource-article-blocks';
import ResourceArticleFaq from '@/app/components/resource-article-faq';
import ResourceArticleShareRow from '@/app/components/resource-article-share-row';
import ResourceArticleVisual from '@/app/components/resource-article-visual';
import SecondaryPageShell from '@/app/components/secondary-page-shell';
import { buildPageMetadata } from '@/app/lib/metadata';
import { getSiteUrl } from '@/app/lib/site-url';
import { getResourceArticleBySlug, resourceArticles } from '@/app/lib/resources-content';

type ResourceArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return resourceArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ResourceArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article introuvable | Qory',
    };
  }

  const metaTitle = article.seoTitle ?? article.title;

  return buildPageMetadata({
    title: `${metaTitle} | Qory`,
    description: article.description,
    path: `/ressources/${article.slug}`,
    imageUrl: article.imageSrc,
    imageAlt: article.imageAlt,
    type: 'article',
  });
}

export default async function ResourceArticlePage({
  params,
}: ResourceArticlePageProps) {
  const { slug } = await params;
  const article = getResourceArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/ressources/${article.slug}`;
  const dateModified = article.dateModifiedIso ?? article.dateIso;
  const [dateY, dateM, dateD] = article.dateIso.split('-').map(Number);
  const articleDateLong = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateY, dateM - 1, dateD));

  const articleLd = {
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.dateIso,
    dateModified,
    author: {
      '@type': 'Organization',
      name: 'Qory',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qory',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.svg`,
      },
    },
    image: `${siteUrl}${article.imageSrc}`,
    mainEntityOfPage: articleUrl,
  };

  const faqLd =
    article.faqs && article.faqs.length > 0
      ? {
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': faqLd ? [articleLd, faqLd] : [articleLd],
  };

  const cta = article.ctaBox ?? {
    title: 'Découvrez où votre site apparaît réellement dans les réponses IA',
    body: 'L’article donne le cadre. Le rapport Qory permet ensuite de mesurer votre présence, vos écarts concurrentiels et les priorités d’optimisation à traiter.',
    href: '/',
    label: 'Lancer une vérification',
  };

  /** Colonne de lecture resserrée ; le hero et le CTA restent pleine largeur du conteneur. */
  const articleProseClass = 'mx-auto w-full max-w-2xl';

  return (
    <SecondaryPageShell containerClassName="max-w-6xl" mainOnly>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className={`${articleProseClass} cv-auto`.trim()}>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#86868B]">{article.category}</p>
        <time dateTime={article.dateIso} className="mt-2 block text-sm text-[#6E6E73]">
          {articleDateLong}
        </time>

        <h1 className="mt-7 text-balance text-[2rem] font-semibold leading-[1.08] tracking-tight text-[#1D1D1F] sm:mt-8 sm:text-[2.75rem] md:text-[3.25rem] md:leading-[1.06]">
          {article.title}
        </h1>
        <p className="mt-5 text-[1.0625rem] font-normal leading-relaxed text-[#1D1D1F] sm:mt-6 sm:text-lg sm:leading-snug">
          {article.excerpt}
        </p>

        <ResourceArticleShareRow url={articleUrl} title={article.title} />
      </header>

      <div className="cv-auto">
        <ResourceArticleVisual
        className="mt-10 min-h-[320px] rounded-[30px] sm:min-h-[400px] lg:min-h-[460px]"
        logoClassName="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
        />
      </div>

      <article className="mt-12 space-y-10 cv-auto">
        {article.sections.map((section) => (
          <section key={section.title} className="space-y-5 cv-auto">
            <h2
              className={`${articleProseClass} text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[2rem]`}
            >
              {section.title}
            </h2>
            <ResourceArticleBlocks
              blocks={expandResourceSectionBlocks(section)}
              proseClassName={articleProseClass}
            />
          </section>
        ))}
      </article>

      {article.faqs && article.faqs.length > 0 ? (
        <section className={`mt-14 border-t border-black/[0.08] pt-12 ${articleProseClass} cv-auto`.trim()}>
          <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[2rem]">FAQ</h2>
          <ResourceArticleFaq items={article.faqs} />
        </section>
      ) : null}

      <section className="mt-14 w-full cv-auto">
        <div className="flex flex-col gap-5 rounded-[28px] bg-[#F16B5D] p-6 sm:p-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{cta.title}</h2>
            <p className="mt-3 leading-relaxed text-white/75">{cta.body}</p>
          </div>

          <Link
            href={cta.href}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-[#111111] transition-colors hover:bg-white/90"
          >
            {cta.label}
          </Link>
        </div>
      </section>
    </SecondaryPageShell>
  );
}
