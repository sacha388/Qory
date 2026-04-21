import type { Metadata } from 'next';
import PourQuiPageExperience from '@/app/components/pour-qui-page-experience';
import { pourQuiPageMeta, pourQuiSegments } from '@/app/lib/pour-qui-content';
import { getSiteUrl } from '@/app/lib/site-url';

export const metadata: Metadata = {
  title: pourQuiPageMeta.documentTitle,
  description: pourQuiPageMeta.seoDescription,
  alternates: {
    canonical: pourQuiPageMeta.path,
  },
};

export default function PourQuiPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${pourQuiPageMeta.path}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Pour qui ?', item: pageUrl },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Pour qui est fait Qory',
    description: pourQuiPageMeta.seoDescription,
    url: pageUrl,
    inLanguage: 'fr-FR',
    hasPart: pourQuiSegments.map((seg) => ({
      '@type': 'WebPage',
      name: seg.title,
      url: `${siteUrl}${seg.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <PourQuiPageExperience />
    </>
  );
}
