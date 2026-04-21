import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlatformVisibilityPage from '@/app/components/platform-visibility-page';
import { getPlatformVisibilityPageById } from '@/app/lib/platform-visibility-pages-content';
import { buildPageMetadata } from '@/app/lib/metadata';

const content = getPlatformVisibilityPageById('claude');

export const metadata: Metadata = content
  ? buildPageMetadata({
      title: content.seoTitle,
      description: content.seoDescription,
      path: content.path,
      imageUrl: content.heroImageSrc,
      imageAlt: content.heroImageAlt,
    })
  : {
      title: 'Page introuvable | Qory',
    };

export default function PresenceClaudePage() {
  if (!content) {
    notFound();
  }

  return <PlatformVisibilityPage content={content} />;
}
