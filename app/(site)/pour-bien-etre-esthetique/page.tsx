import type { Metadata } from 'next';
import { buildPageMetadata } from '@/app/lib/metadata';
import { notFound } from 'next/navigation';
import UseCaseSectorPage from '@/app/components/use-case-sector-page';
import {
  getReadyUseCaseSectorPageBySlug,
  getUseCaseFamilyBySlug,
} from '@/app/lib/use-cases-content';

const pageData = getReadyUseCaseSectorPageBySlug('bien-etre-esthetique');
const familyData = pageData ? getUseCaseFamilyBySlug(pageData.familySlug) : undefined;

export const metadata: Metadata = pageData
  ? buildPageMetadata({
      title: pageData.seoTitle,
      description: pageData.seoDescription,
      path: pageData.path,
    })
  : {
      title: 'Page introuvable | Qory',
    };

export default function WellnessUseCasePage() {
  if (!pageData || !familyData) {
    notFound();
  }

  return <UseCaseSectorPage family={familyData} page={pageData} />;
}
