import type { Metadata } from 'next';
import PremiumStaticPage from '@/app/components/premium-static-page';
import { buildPageMetadata } from '@/app/lib/metadata';
import { premiumStaticPages } from '@/app/lib/premium-static-pages-content';

const page = premiumStaticPages.tarifs;

export const metadata: Metadata = buildPageMetadata({
  title: 'Tarifs Qory | Débloquer votre rapport complet',
  description: page.seoDescription,
  path: page.path,
});

export default function TarifsPage() {
  return <PremiumStaticPage page={page} />;
}
