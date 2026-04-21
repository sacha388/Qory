import type { Metadata } from 'next';
import PremiumStaticPage from '@/app/components/premium-static-page';
import { premiumStaticPages } from '@/app/lib/premium-static-pages-content';

const page = premiumStaticPages.tarifs;

export const metadata: Metadata = {
  title: 'Tarifs Qory | Débloquer votre rapport complet',
  description: page.seoDescription,
  alternates: {
    canonical: page.path,
  },
};

export default function TarifsPage() {
  return <PremiumStaticPage page={page} />;
}
