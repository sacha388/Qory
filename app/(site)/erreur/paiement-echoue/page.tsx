import type { Metadata } from 'next';
import ErrorStatePage from '@/app/components/error-state-page';

type PaymentFailedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: 'Paiement échoué | Qory',
  description: 'Le paiement n’a pas pu être validé. Vous pouvez réessayer.',
  alternates: {
    canonical: '/erreur/paiement-echoue',
  },
};

function parseSingleParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

export default async function PaymentFailedErrorPage({
  searchParams,
}: PaymentFailedPageProps) {
  const params = await searchParams;
  const retryOverride = parseSingleParam(params.retry);
  const sourceUrl = parseSingleParam(params.url);

  const retryHref =
    retryOverride && retryOverride.startsWith('/')
      ? retryOverride
      : sourceUrl
        ? `/?url=${encodeURIComponent(sourceUrl)}`
        : '/';

  return (
    <ErrorStatePage
      eyebrow="Paiement échoué"
      title="Le paiement n’a pas abouti"
      description="Aucun débit n’a été confirmé. Vous pouvez réessayer immédiatement."
      equalActionWidths
      actions={[
        {
          href: retryHref,
          label: 'Réessayer',
        },
        {
          href: '/',
          label: "Retour à l'accueil",
          variant: 'secondary',
        },
      ]}
    />
  );
}
