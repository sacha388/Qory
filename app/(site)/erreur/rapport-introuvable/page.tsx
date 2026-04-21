import type { Metadata } from 'next';
import ErrorStatePage from '@/app/components/error-state-page';

export const metadata: Metadata = {
  title: 'Rapport introuvable | Qory',
  description: 'Le rapport demandé est introuvable ou indisponible.',
  alternates: {
    canonical: '/erreur/rapport-introuvable',
  },
};

export default function ReportNotFoundErrorPage() {
  return (
    <ErrorStatePage
      eyebrow="Rapport introuvable"
      title="Ce rapport est introuvable"
      description="Le lien peut être expiré ou invalide. Relancez une vérification depuis l’accueil."
      actions={[
        {
          href: '/',
          label: "Retour à l'accueil",
        },
      ]}
    />
  );
}
