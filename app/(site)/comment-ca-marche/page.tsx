import type { Metadata } from 'next';
import PremiumStaticPage from '@/app/components/premium-static-page';
import { premiumStaticPages } from '@/app/lib/premium-static-pages-content';

const page = premiumStaticPages['comment-ca-marche'];

export const metadata: Metadata = {
  title: 'Comment fonctionne Qory | Mesurez votre visibilité IA',
  description: page.seoDescription,
  alternates: {
    canonical: page.path,
  },
};

export default function CommentCaMarchePage() {
  return <PremiumStaticPage page={page} />;
}
