import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlatformVisibilityPage from '@/app/components/platform-visibility-page';
import { getPlatformVisibilityPageById } from '@/app/lib/platform-visibility-pages-content';

const content = getPlatformVisibilityPageById('claude');

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

export default function PresenceClaudePage() {
  if (!content) {
    notFound();
  }

  return <PlatformVisibilityPage content={content} />;
}
