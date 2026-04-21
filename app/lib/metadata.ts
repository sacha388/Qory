import type { Metadata } from 'next';

type BuildPageMetadataParams = {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
};

const DEFAULT_IMAGE_URL = '/og-image.png';

export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl = DEFAULT_IMAGE_URL,
  imageAlt,
  type = 'website',
}: BuildPageMetadataParams): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      url: path,
      siteName: 'Qory',
      title,
      description,
      locale: 'fr_FR',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
