import type { Metadata } from 'next';
import ContactPageExperience from '@/app/components/contact-page-experience';
import { contactPageMeta } from '@/app/lib/contact-page-content';
import { buildPageMetadata } from '@/app/lib/metadata';
import { getSiteUrl } from '@/app/lib/site-url';

export const metadata: Metadata = buildPageMetadata({
  title: contactPageMeta.documentTitle,
  description: contactPageMeta.seoDescription,
  path: contactPageMeta.path,
});

export default function ContactPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${contactPageMeta.path}`;

  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: contactPageMeta.title,
    description: contactPageMeta.seoDescription,
    url: pageUrl,
    inLanguage: 'fr-FR',
    mainEntity: {
      '@type': 'Organization',
      name: 'Qory',
      email: contactPageMeta.email,
      url: siteUrl,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ContactPageExperience />
    </>
  );
}
