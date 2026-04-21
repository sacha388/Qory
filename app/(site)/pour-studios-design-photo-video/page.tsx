import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UseCaseSectorPage from '@/app/components/use-case-sector-page';
import {
  getReadyUseCaseSectorPageBySlug,
  getUseCaseFamilyBySlug,
} from '@/app/lib/use-cases-content';

const pageData = getReadyUseCaseSectorPageBySlug('studios-design-photo-video');
const familyData = pageData ? getUseCaseFamilyBySlug(pageData.familySlug) : undefined;

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

export default function CreativeStudioUseCasePage() {
  if (!pageData || !familyData) {
    notFound();
  }

  return <UseCaseSectorPage family={familyData} page={pageData} />;
}
