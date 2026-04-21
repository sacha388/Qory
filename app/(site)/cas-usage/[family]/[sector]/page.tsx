import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SecondaryPageShell from '@/app/components/secondary-page-shell';
import { getSiteUrl } from '@/app/lib/site-url';
import {
  getUseCaseFamilyBySlug,
  getUseCaseSectorByFamilyAndSlug,
  getUseCaseSectorHref,
  useCaseFamilies,
} from '@/app/lib/use-cases-content';

type UseCaseSectorPageProps = {
  params: Promise<{ family: string; sector: string }>;
};

export async function generateStaticParams() {
  return useCaseFamilies.flatMap((family) =>
    family.sectors
      .filter((sector) => !sector.path)
      .map((sector) => ({ family: family.slug, sector: sector.slug }))
  );
}

export async function generateMetadata({
  params,
}: UseCaseSectorPageProps): Promise<Metadata> {
  const { family, sector } = await params;
  const familyData = getUseCaseFamilyBySlug(family);
  const sectorData = familyData ? getUseCaseSectorByFamilyAndSlug(family, sector) : undefined;

  if (!familyData || !sectorData) {
    return {
      title: 'Page introuvable | Qory',
    };
  }

  return {
    title: `${sectorData.title} | Qory`,
    description: sectorData.summary,
    alternates: {
      canonical: getUseCaseSectorHref(familyData.slug, sectorData),
    },
  };
}

export default async function UseCaseSectorPlaceholderPage({
  params,
}: UseCaseSectorPageProps) {
  const { family, sector } = await params;
  const familyData = getUseCaseFamilyBySlug(family);
  const sectorData = familyData ? getUseCaseSectorByFamilyAndSlug(family, sector) : undefined;

  if (!familyData || !sectorData) {
    notFound();
  }

  if (sectorData.path) {
    redirect(sectorData.path);
  }

  const siteUrl = getSiteUrl();
  const canonicalPath = getUseCaseSectorHref(familyData.slug, sectorData);
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: sectorData.title,
    description: sectorData.summary,
    url: `${siteUrl}${canonicalPath}`,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Qory',
      url: siteUrl,
    },
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
            {sectorData.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#5C5C64] sm:text-lg md:text-xl">
            {sectorData.summary}
          </p>
        </header>

        <section className="mt-10 max-w-3xl space-y-5 text-left">
          <p className="text-base leading-relaxed text-[#5C5C64] sm:text-lg">
            {sectorData.searchFocus}
          </p>
          <p className="text-base leading-relaxed text-[#5C5C64] sm:text-lg">
            Cette page sectorielle est déjà préparée pour la suite. Le wording, l’angle SEO et le
            périmètre sont cadrés, et elle sera branchée sur le template complet Qory au fur et à
            mesure.
          </p>
          <p className="text-base leading-relaxed text-[#5C5C64] sm:text-lg">
            En attendant, vous pouvez déjà lancer un audit depuis la home ou revenir à la famille
            pour explorer les autres secteurs couverts.
          </p>
        </section>

        <section className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/cas-usage/${familyData.slug}`}
            className="text-base font-semibold text-[#4BA7F5] underline-offset-4 transition-colors hover:text-[#6BB8FF] hover:underline"
          >
            Revenir à {familyData.label}
          </Link>
          <Link
            href="/"
            className="text-base font-semibold text-[#4BA7F5] underline-offset-4 transition-colors hover:text-[#6BB8FF] hover:underline"
          >
            Aller sur l’accueil Qory
          </Link>
        </section>
      </>
    </SecondaryPageShell>
  );
}
