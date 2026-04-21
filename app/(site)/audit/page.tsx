import type { Metadata } from 'next';
import AuditFlowPage from '@/app/components/audit-flow-page';

const pageDescription =
  'Lancez votre audit Qory, répondez à quelques questions, puis débloquez votre rapport complet de visibilité IA.';

export const metadata: Metadata = {
  title: 'Audit Qory | Lancez votre analyse de visibilité IA',
  description: pageDescription,
  alternates: {
    canonical: '/audit',
  },
};

type AuditPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function isValidAuditUrl(rawUrl: string): boolean {
  if (!rawUrl) {
    return false;
  }

  const normalizedUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  try {
    new URL(normalizedUrl);
    return true;
  } catch {
    return false;
  }
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialUrl = getFirstQueryValue(resolvedSearchParams.url);
  const initialReturnTo = getFirstQueryValue(resolvedSearchParams.returnTo) || '/';
  const safeInitialUrl = isValidAuditUrl(initialUrl) ? initialUrl : '';

  return (
    <AuditFlowPage
      initialUrl={safeInitialUrl}
      initialReturnTo={initialReturnTo}
    />
  );
}
