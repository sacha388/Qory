import type { Metadata } from 'next';
import ProductComparisonPage from '@/app/components/product-comparison-page';
import { qoryVsHubspotPage } from '@/app/lib/comparison-pages-content';
import { buildPageMetadata } from '@/app/lib/metadata';
import { getSiteUrl } from '@/app/lib/site-url';

const page = qoryVsHubspotPage;

export const metadata: Metadata = buildPageMetadata({
  title: `${page.seoTitle} | Qory`,
  description: page.seoDescription,
  path: page.path,
});

export default function QoryVsHubspotPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${page.path}`;

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.breadcrumbLabel,
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
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: page.breadcrumbLabel, item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductComparisonPage content={page} />
    </>
  );
}
