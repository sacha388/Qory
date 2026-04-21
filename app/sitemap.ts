import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/app/lib/site-url';
import { resourceArticles } from '@/app/lib/resources-content';
import {
  getPlannedUseCaseSectorPaths,
  getReadyUseCaseSectorPaths,
  useCaseFamilies,
} from '@/app/lib/use-cases-content';

const PUBLIC_ROUTES = [
  '/',
  '/audit',
  '/audit-visibilite-ia',
  '/presence-reponses-ia',
  '/presence-chatgpt',
  '/presence-claude',
  '/presence-perplexity',
  '/analyse-reponses-ia',
  '/comment-ca-marche',
  '/pour-qui',
  '/vision',
  '/faq',
  '/tarifs',
  '/ressources',
  '/cas-usage',
  '/securite',
  '/contact',
  '/confidentialite',
  '/mentions-legales',
  '/conditions',
  '/qory-vs-hubspot-aeo-grader',
  '/qory-vs-otterly',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const articleRoutes = resourceArticles.map((article) => `/ressources/${article.slug}`);
  const useCaseHubRoutes = useCaseFamilies.map((family) => `/cas-usage/${family.slug}`);
  const readyUseCaseRoutes = getReadyUseCaseSectorPaths();
  const plannedUseCaseRoutes = getPlannedUseCaseSectorPaths();
  const routes = [
    ...PUBLIC_ROUTES,
    ...articleRoutes,
    ...useCaseHubRoutes,
    ...readyUseCaseRoutes,
    ...plannedUseCaseRoutes,
  ];

  return routes.map((route) => ({
    url: route === '/' ? siteUrl : `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === '/' ? 'daily' : 'monthly',
    priority:
      route === '/'
        ? 1
        : route.startsWith('/ressources/')
          ? 0.75
          : route.startsWith('/cas-usage/')
            ? 0.72
            : route === '/cas-usage'
              ? 0.78
              : route.startsWith('/pour-')
                ? 0.74
                : 0.7,
  }));
}
