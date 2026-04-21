import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AiVisibilityPage from '@/app/components/ai-visibility-page';
import { getAiVisibilityPageBySlug } from '@/app/lib/ai-visibility-pages-content';

const pageData = getAiVisibilityPageBySlug('audit-visibilite-ia');

export const metadata: Metadata = pageData
  ? {
      title: pageData.seoTitle,
      description: pageData.seoDescription,
      alternates: {
        canonical: pageData.path,
      },
    }
  : {
      title: 'Page introuvable | Qory',
    };

export default function AuditVisibiliteIaPage() {
  if (!pageData) {
    notFound();
  }

  return <AiVisibilityPage page={pageData} />;
}
