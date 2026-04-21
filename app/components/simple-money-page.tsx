import MoneyPageExperience from '@/app/components/money-page-experience';
import type { MoneyPageData } from '@/app/lib/money-pages-content';
import { getSiteUrl } from '@/app/lib/site-url';

type SimpleMoneyPageProps = {
  page: MoneyPageData;
};

export default function SimpleMoneyPage({ page }: SimpleMoneyPageProps) {
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
        name: page.eyebrow,
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
      <MoneyPageExperience page={page} />
    </>
  );
}
