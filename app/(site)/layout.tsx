import { Suspense } from 'react';
import { RouteProgressBar } from '@/app/components/route-progress-bar';
import { SiteRoutePrefetch } from '@/app/components/site-route-prefetch';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <RouteProgressBar />
        <SiteRoutePrefetch />
      </Suspense>
      {children}
    </>
  );
}
