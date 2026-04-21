'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  attachRouteProgressListeners,
  completeRouteProgress,
  subscribeToRouteProgress,
  type RouteProgressSnapshot,
} from '@/app/components/route-progress-store';

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';
  const [state, setState] = useState<RouteProgressSnapshot>({
    isVisible: false,
    progress: 0,
  });

  useEffect(() => subscribeToRouteProgress(setState), []);

  useEffect(() => {
    completeRouteProgress();
  }, [pathname, search]);

  useEffect(() => attachRouteProgressListeners(), []);

  return (
    <div
      aria-hidden="true"
      className={`route-progress ${state.isVisible ? 'route-progress--visible' : ''}`}
    >
      <span
        className="route-progress__bar"
        style={{ transform: `scaleX(${Math.max(state.progress, 0.02)})` }}
      />
    </div>
  );
}
