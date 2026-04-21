import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UseCaseSectorPage from '@/app/components/use-case-sector-page';
import {
  getReadyUseCaseSectorPageBySlug,
  getUseCaseFamilyBySlug,
} from '@/app/lib/use-cases-content';

const pageData = getReadyUseCaseSectorPageBySlug('conseil-rh-freelances-data-ia');
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

export default function ExpertiseB2BUseCasePage() {
  if (!pageData || !familyData) {
    notFound();
  }

  return <UseCaseSectorPage family={familyData} page={pageData} />;
}
