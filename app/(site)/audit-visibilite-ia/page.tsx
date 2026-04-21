import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AiVisibilityPage from '@/app/components/ai-visibility-page';
import { getAiVisibilityPageBySlug } from '@/app/lib/ai-visibility-pages-content';
import { buildPageMetadata } from '@/app/lib/metadata';

const pageData = getAiVisibilityPageBySlug('audit-visibilite-ia');

export const metadata: Metadata = pageData
  ? buildPageMetadata({
      title: pageData.seoTitle,
      description: pageData.seoDescription,
      path: pageData.path,
    })
  : {
      title: 'Page introuvable | Qory',
    };

export default function AuditVisibiliteIaPage() {
  if (!pageData) {
    notFound();
  }

  return <AiVisibilityPage page={pageData} />;
}
