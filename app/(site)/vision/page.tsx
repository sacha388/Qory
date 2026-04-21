import type { Metadata } from 'next';
import VisionPageExperience from '@/app/components/vision-page-experience';
import { buildPageMetadata } from '@/app/lib/metadata';
import { getSiteUrl } from '@/app/lib/site-url';

const path = '/vision';

export const metadata: Metadata = buildPageMetadata({
  title: 'Vision | Qory',
  description:
    'Qory lit la nouvelle couche de visibilité des marques dans les réponses des intelligences artificielles.',
  path,
});

export default function VisionPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${path}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Vision', item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <VisionPageExperience />
    </>
  );
}
