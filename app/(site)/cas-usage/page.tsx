import type { Metadata } from 'next';
import Link from 'next/link';
import SecondaryPageHero from '@/app/components/secondary-page-hero';
import SecondaryPageShell from '@/app/components/secondary-page-shell';
import { buildPageMetadata } from '@/app/lib/metadata';
import { TypeOptionIcon } from '@/app/components/paid-scan-questionnaire-icons';
import { getSiteUrl } from '@/app/lib/site-url';
import { useCaseFamilies } from '@/app/lib/use-cases-content';
import { PAID_SCAN_TYPE_OPTIONS } from '@/lib/scanner/paid-scan-catalog';
import type { PaidScanBusinessType } from '@/types';

const pageDescription =
  'Choisissez votre marché, puis découvrez comment Qory adapte ses pages et son audit à votre business.';

export const metadata: Metadata = buildPageMetadata({
  title: 'Cas d’usage Qory | Choisissez votre marché',
  description: pageDescription,
  path: '/cas-usage',
});

const FAMILY_SLUG_BY_TYPE: Record<PaidScanBusinessType, string> = {
  commerce_restauration: 'commerces-restauration',
  prestataire_local: 'prestataires-locaux',
  agence_studio: 'agences-studios',
  saas_application: 'saas-applications',
  ia_assistants: 'produits-ia',
  plateforme_annuaire: 'plateformes-annuaires',
  ecommerce: 'ecommerce',
  etablissement_institution: 'etablissements-institutions',
};

export default function UseCasesPage() {
  const siteUrl = getSiteUrl();
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cas d’usage Qory',
    description: pageDescription,
    url: `${siteUrl}/cas-usage`,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Qory',
      url: siteUrl,
    },
    hasPart: useCaseFamilies.map((family) => ({
      '@type': 'CollectionPage',
      name: family.label,
      url: `${siteUrl}/cas-usage/${family.slug}`,
    })),
  };

  return (
    <SecondaryPageShell
      containerClassName="max-w-[min(100%,80rem)]"
      fullViewportTop
      topContentBottomPaddingClassName="pb-4 sm:pb-5 md:pb-6"
      contentPaddingClassName="pt-4 pb-16 sm:pt-5 sm:pb-20 md:pt-6 md:pb-28"
      topContent={
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
          />
          <SecondaryPageHero
            title="Cas d’usage"
            description="Que vous vendiez en local, en SaaS, en e-commerce ou dans un univers plus institutionnel, Qory adapte son audit à votre réalité. Choisissez votre famille de business, puis découvrez les pages sectorielles à activer pour attirer les bonnes recherches et convertir plus vite."
            sectionPaddingBottomClassName="pb-4 sm:pb-5 md:pb-6"
          />
        </>
      }
    >
      <section className="border-t border-black/[0.06] pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {PAID_SCAN_TYPE_OPTIONS.map((option) => {
            const familySlug = FAMILY_SLUG_BY_TYPE[option.id];
            const familyHref = `/cas-usage/${familySlug}`;

            return (
              <Link
                key={option.id}
                href={familyHref}
                className="group relative flex min-h-[152px] items-end overflow-hidden rounded-[28px] bg-[#F5F5F7] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:bg-[#E7EAF0] sm:min-h-[200px] sm:p-7 lg:min-h-[220px] lg:p-8"
              >
                <TypeOptionIcon
                  type={option.id}
                  className="absolute right-5 top-5 h-10 w-10 text-[#4BA7F5] sm:right-6 sm:top-6 sm:h-12 sm:w-12 lg:right-8 lg:top-8 lg:h-14 lg:w-14"
                />
                <div className="max-w-[16ch] pr-2 text-[1.28rem] font-semibold leading-[1.08] tracking-tight text-[#1D1D1F] sm:max-w-[18ch] sm:text-[1.85rem] lg:text-[1.95rem]">
                  {option.label}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </SecondaryPageShell>
  );
}
