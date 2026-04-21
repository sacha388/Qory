import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SecondaryPageShell from '@/app/components/secondary-page-shell';
import { buildPageMetadata } from '@/app/lib/metadata';
import { getSiteUrl } from '@/app/lib/site-url';
import {
  getUseCaseFamilyBySlug,
  getUseCaseSectorHref,
  useCaseFamilies,
} from '@/app/lib/use-cases-content';

type UseCaseFamilyPageProps = {
  params: Promise<{ family: string }>;
};

export async function generateStaticParams() {
  return useCaseFamilies.map((family) => ({ family: family.slug }));
}

export async function generateMetadata({
  params,
}: UseCaseFamilyPageProps): Promise<Metadata> {
  const { family } = await params;
  const familyData = getUseCaseFamilyBySlug(family);

  if (!familyData) {
    return {
      title: 'Cas d’usage introuvable | Qory',
    };
  }

  return buildPageMetadata({
    title: `${familyData.label} | Cas d’usage Qory`,
    description: familyData.hubDescription,
    path: `/cas-usage/${familyData.slug}`,
  });
}

export default async function UseCaseFamilyPage({
  params,
}: UseCaseFamilyPageProps) {
  const { family } = await params;
  const familyData = getUseCaseFamilyBySlug(family);

  if (!familyData) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: familyData.hubTitle,
    description: familyData.hubDescription,
    url: `${siteUrl}/cas-usage/${familyData.slug}`,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Qory',
      url: siteUrl,
    },
    hasPart: familyData.sectors.map((sector) => ({
      '@type': 'WebPage',
      name: sector.title,
      description: sector.summary,
      url: `${siteUrl}${getUseCaseSectorHref(familyData.slug, sector)}`,
    })),
  };

  return (
    <SecondaryPageShell containerClassName="max-w-6xl" mainOnly>
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
        />
        <header className="text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4BA7F5]">
            {familyData.label}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[#1D1D1F] sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem]">
            {familyData.hubTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#5C5C64] sm:text-lg md:text-xl">
            {familyData.hubDescription}
          </p>
        </header>

        <section className="mt-12">
          <ul className="space-y-4">
            {familyData.sectors.map((sector) => (
              <li key={sector.slug}>
                <Link
                  href={getUseCaseSectorHref(familyData.slug, sector)}
                  className="text-lg font-semibold text-[#4BA7F5] underline-offset-4 transition-colors hover:text-[#6BB8FF] hover:underline sm:text-xl"
                >
                  {sector.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </>
    </SecondaryPageShell>
  );
}
