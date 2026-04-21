import { cookies, headers } from 'next/headers';
import type { Audit } from '@/types';
import ReportPdfDocument from '../report-pdf-document';

type PageSearchParams = Record<string, string | string[] | undefined>;

function firstQueryValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function getOriginFromRequestHeaders(headerStore: Headers): string | null {
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  if (!host) return null;

  const protocol =
    headerStore.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

async function fetchAuditForPdf(id: string, searchParams: PageSearchParams): Promise<{
  audit: Audit | null;
  error: string | null;
}> {
  const requestHeaders = await headers();
  const origin = getOriginFromRequestHeaders(requestHeaders);
  if (!origin) {
    return {
      audit: null,
      error: 'Impossible de déterminer l’URL de base pour générer le PDF.',
    };
  }

  const sessionId = firstQueryValue(searchParams.session_id);
  const accessToken = firstQueryValue(searchParams.t);
  const shareToken = firstQueryValue(searchParams.st);

  const apiParams = new URLSearchParams();
  if (sessionId) apiParams.set('session_id', sessionId);
  if (shareToken) apiParams.set('st', shareToken);

  const cookieHeader = (await cookies()).toString();
  const forwardHeaders: HeadersInit = {};
  if (cookieHeader) {
    forwardHeaders.Cookie = cookieHeader;
  }
  if (accessToken) {
    forwardHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${origin}/api/report/${id}${apiParams.toString() ? `?${apiParams.toString()}` : ''}`,
    {
      headers: forwardHeaders,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message =
      typeof errorPayload?.error === 'string'
        ? errorPayload.error
        : `Impossible de charger le rapport (status ${response.status}).`;

    return { audit: null, error: message };
  }

  const audit = (await response.json()) as Audit;
  if (!audit?.report) {
    return {
      audit: null,
      error: 'Le rapport ne contient pas de données exploitables pour le PDF.',
    };
  }

  return { audit, error: null };
}

function PdfErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-white">
      <div
        data-report-pdf-document="error"
        data-report-pdf-error-message={message}
        className="mx-auto flex min-h-screen w-full max-w-[900px] items-center justify-center px-8 py-12 text-center"
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F]">Génération PDF indisponible</h1>
          <p className="mt-3 text-sm text-[#4B5563]">{message}</p>
        </div>
      </div>
    </main>
  );
}

export default async function ReportPdfPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { audit, error } = await fetchAuditForPdf(id, resolvedSearchParams);

  if (!audit || error) {
    return <PdfErrorScreen message={error ?? 'Erreur inconnue lors de la génération du PDF.'} />;
  }

  return (
    <main className="min-h-screen bg-white">
      <div data-report-pdf-document="ready">
        <ReportPdfDocument audit={audit} />
      </div>
    </main>
  );
}
