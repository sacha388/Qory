import CommentCaMarcheExperience from '@/app/components/comment-ca-marche-experience';
import PremiumStaticPageExperience from '@/app/components/premium-static-page-experience';
import TarifsPageExperience from '@/app/components/tarifs-page-experience';
import { getSiteUrl } from '@/app/lib/site-url';
import type { PremiumStaticPageData } from '@/app/lib/premium-static-pages-content';

type PremiumStaticPageProps = {
  page: PremiumStaticPageData;
};

export default function PremiumStaticPage({ page }: PremiumStaticPageProps) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${page.path}`;

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.seoDescription,
    url: pageUrl,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Qory',
      url: siteUrl,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.breadcrumbLabel,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {page.tarifsBand && page.modelsStrip ? (
        <TarifsPageExperience page={page} />
      ) : page.howItWorksBlocks && page.howItWorksBlocks.length > 0 ? (
        <CommentCaMarcheExperience page={page} />
      ) : (
        <PremiumStaticPageExperience page={page} />
      )}
    </>
  );
}
