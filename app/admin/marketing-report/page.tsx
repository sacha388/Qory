import type { Metadata } from 'next';
import MarketingReportAdminPage from '@/app/components/marketing-report-admin-page';

export const metadata: Metadata = {
  title: 'Rapport marketing interne | Qory',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <MarketingReportAdminPage />;
}
