import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/app/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/comment-ca-marche',
        '/faq',
        '/tarifs',
        '/securite',
        '/contact',
      ],
      disallow: ['/api/', '/scan/', '/results/', '/report/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
