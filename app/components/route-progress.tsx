'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { startRouteProgress } from '@/app/components/route-progress-store';

export function useRouteProgressRouter() {
  const router = useRouter();

  return useMemo(
    () => ({
      push: (...args: Parameters<typeof router.push>) => {
        startRouteProgress();
        router.push(...args);
      },
      replace: (...args: Parameters<typeof router.replace>) => {
        startRouteProgress();
        router.replace(...args);
      },
      back: () => {
        startRouteProgress();
        router.back();
      },
      forward: () => {
        startRouteProgress();
        router.forward();
      },
      refresh: () => {
        router.refresh();
      },
      prefetch: (...args: Parameters<typeof router.prefetch>) => router.prefetch(...args),
    }),
    [router]
  );
}
