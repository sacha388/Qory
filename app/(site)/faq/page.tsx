import type { Metadata } from 'next';
import FaqPageExperience from '@/app/components/faq-page-experience';
import { faqChapters, faqPageMeta } from '@/app/lib/faq-page-content';
import { buildPageMetadata } from '@/app/lib/metadata';
import { getSiteUrl } from '@/app/lib/site-url';

export const metadata: Metadata = buildPageMetadata({
  title: faqPageMeta.documentTitle,
  description: faqPageMeta.seoDescription,
  path: faqPageMeta.path,
});

export default function FaqPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${faqPageMeta.path}`;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqChapters.flatMap((chapter) =>
      chapter.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <FaqPageExperience />
    </>
  );
}
