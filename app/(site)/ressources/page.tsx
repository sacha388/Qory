import type { Metadata } from 'next';
import Link from 'next/link';
import ResourceArticleVisual from '@/app/components/resource-article-visual';
import RessourcesBlogHero from '@/app/components/ressources-blog-hero';
import SecondaryPageShell from '@/app/components/secondary-page-shell';
import { buildPageMetadata } from '@/app/lib/metadata';
import { resourceArticles } from '@/app/lib/resources-content';

const pageDescription =
  'Ressources Qory : articles et guides pour comprendre la visibilité IA, les citations dans les assistants et les actions prioritaires à mener.';

export const metadata: Metadata = buildPageMetadata({
  title: 'Ressources Qory | Articles et guides GEO',
  description: pageDescription,
  path: '/ressources',
});

export default function RessourcesPage() {
  return (
    <SecondaryPageShell
      containerClassName="max-w-6xl"
      landingHeaderLightSurface={false}
      fullBleedTop={<RessourcesBlogHero />}
    >
      <section className="border-t border-black/[0.08] cv-auto">
        {resourceArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/ressources/${article.slug}`}
            className="group grid gap-6 border-b border-black/[0.08] py-8 transition-opacity hover:opacity-88 sm:gap-8 md:grid-cols-[320px_minmax(0,1fr)] md:items-center md:py-10 cv-auto"
          >
            <ResourceArticleVisual
              className="min-h-[196px]"
              logoClassName="h-16 w-16 transition-transform duration-500 sm:h-[4.5rem] sm:w-[4.5rem]"
              logoHoverClassName="group-hover:scale-[1.04]"
            />

            <div className="flex min-w-0 flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6E6E73] sm:text-sm">
                {article.category}
              </p>
              <h2 className="mt-3 max-w-3xl text-[1.9rem] font-semibold leading-[1.08] tracking-tight text-[#1D1D1F] sm:text-[2.1rem]">
                {article.title}
              </h2>
              <p className="mt-4 text-base font-medium text-[#6E6E73] sm:text-[1.05rem]">
                {article.dateLabel}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </SecondaryPageShell>
  );
}
