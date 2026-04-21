import type { Metadata } from 'next';
import { getSiteUrl } from '@/app/lib/site-url';
import { MicrosoftClarity } from '@/app/components/microsoft-clarity';
import './globals.css';

const siteUrl = getSiteUrl();
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Qory',
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Qory',
  url: siteUrl,
  inLanguage: 'fr-FR',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Qory | Mesurez votre visibilité IA',
  description: 'Découvrez si votre site ressort dans les réponses IA.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Qory',
    title: 'Qory | Mesurez votre visibilité IA',
    description: 'Découvrez si votre site ressort dans les réponses IA.',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Qory - Mesurez votre visibilité IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qory | Mesurez votre visibilité IA',
    description: 'Découvrez si votre site ressort dans les réponses IA.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <MicrosoftClarity />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </body>
    </html>
  );
}
