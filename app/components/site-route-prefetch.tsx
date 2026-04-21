'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PREFETCH_GROUPS = {
  footerPrimary: [
    '/',
    '/audit',
    '/comment-ca-marche',
    '/pour-qui',
    '/tarifs',
    '/faq',
    '/vision',
    '/contact',
    '/conditions',
    '/confidentialite',
    '/mentions-legales',
    '/securite',
  ],
  footerAi: [
    '/presence-reponses-ia',
    '/presence-chatgpt',
    '/presence-claude',
    '/presence-perplexity',
    '/analyse-reponses-ia',
    '/audit-visibilite-ia',
  ],
  footerDiscovery: [
    '/cas-usage',
    '/cas-usage/saas-applications',
    '/cas-usage/ecommerce',
    '/cas-usage/prestataires-locaux',
    '/ressources',
    '/qory-vs-hubspot-aeo-grader',
    '/qory-vs-otterly',
    '/ressources/quest-ce-que-le-geo',
    '/ressources/seo-vs-geo',
    '/ressources/comment-savoir-si-chatgpt-cite-votre-site',
  ],
} as const;

const prefetchedRoutes = new Set<string>();
type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

function getPrefetchQueue(pathname: string) {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  const orderedRoutes = [
    ...PREFETCH_GROUPS.footerPrimary,
    ...PREFETCH_GROUPS.footerAi,
    ...PREFETCH_GROUPS.footerDiscovery,
  ];

  return orderedRoutes.filter((route) => {
    if (route === normalized || prefetchedRoutes.has(route)) {
      return false;
    }

    return true;
  });
}

export function SiteRoutePrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (
      pathname.startsWith('/scan') ||
      pathname.startsWith('/report') ||
      pathname.startsWith('/api')
    ) {
      return;
    }

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) {
      return;
    }

    const queue = getPrefetchQueue(pathname);
    if (queue.length === 0) {
      return;
    }

    let cancelled = false;
    let timerHandle: number | null = null;
    let idleHandle: number | null = null;
    const idleWindow = window as IdleWindow;

    const runPrefetchBatch = () => {
      let processed = 0;

      while (queue.length > 0 && !cancelled && processed < 8) {
        const route = queue.shift();
        if (!route || prefetchedRoutes.has(route)) {
          continue;
        }

        prefetchedRoutes.add(route);
        router.prefetch(route);
        processed += 1;
      }

      if (cancelled || queue.length === 0) {
        return;
      }

      timerHandle = window.setTimeout(runPrefetchBatch, 60);
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleHandle = idleWindow.requestIdleCallback(runPrefetchBatch, { timeout: 150 });
    } else {
      timerHandle = window.setTimeout(runPrefetchBatch, 60);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== null && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleHandle);
      }
      if (timerHandle === null) {
        return;
      }
      window.clearTimeout(timerHandle);
    };
  }, [pathname, router]);

  return null;
}
