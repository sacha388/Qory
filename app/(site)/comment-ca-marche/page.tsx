import type { Metadata } from 'next';
import PremiumStaticPage from '@/app/components/premium-static-page';
import { buildPageMetadata } from '@/app/lib/metadata';
import { premiumStaticPages } from '@/app/lib/premium-static-pages-content';

const page = premiumStaticPages['comment-ca-marche'];

export const metadata: Metadata = buildPageMetadata({
  title: 'Comment fonctionne Qory | Mesurez votre visibilité IA',
  description: page.seoDescription,
  path: page.path,
});

export default function CommentCaMarchePage() {
  return <PremiumStaticPage page={page} />;
}
