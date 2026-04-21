import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AiVisibilityPage from '@/app/components/ai-visibility-page';
import { getAiVisibilityPageBySlug } from '@/app/lib/ai-visibility-pages-content';

const content = getAiVisibilityPageBySlug('presence-reponses-ia');

export const metadata: Metadata = content
  ? {
      title: content.seoTitle,
      description: content.seoDescription,
      alternates: {
        canonical: content.path,
      },
    }
  : {
      title: 'Page introuvable | Qory',
    };

export default function PresenceReponsesIaPage() {
  if (!content) {
    notFound();
  }

  return <AiVisibilityPage page={content} />;
}
