import type { NextRequest } from 'next/server';

function normalizeOrigin(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

function getConfiguredOrigins(): string[] {
  const origins = new Set<string>();
  const csv = process.env.APP_ALLOWED_ORIGINS;

  if (csv) {
    for (const part of csv.split(',')) {
      const normalized = normalizeOrigin(part);
      if (normalized) {
        origins.add(normalized);
      }
    }
  }

  const raw =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    null;

  if (raw) {
    const normalized = normalizeOrigin(raw);
    if (normalized) {
      origins.add(normalized);
    }
  }

  return Array.from(origins);
}

function getRequestHostOrigins(request: NextRequest): string[] {
  const origins = new Set<string>();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.trim();

  if (!host) {
    return [];
  }

  const protocolCandidates = new Set<string>();
  if (forwardedProto) {
    protocolCandidates.add(forwardedProto);
  }

  if (request.nextUrl.protocol === 'http:' || request.nextUrl.protocol === 'https:') {
    protocolCandidates.add(request.nextUrl.protocol.replace(':', ''));
  }

  if (protocolCandidates.size === 0) {
    protocolCandidates.add(process.env.NODE_ENV === 'development' ? 'http' : 'https');
  }

  for (const proto of protocolCandidates) {
    const normalized = normalizeOrigin(`${proto}://${host}`);
    if (normalized) {
      origins.add(normalized);
    }
  }

  return Array.from(origins);
}

export function assertAllowedOrigin(request: NextRequest): void {
  const origin = request.headers.get('origin');
  if (!origin) return; // server-to-server or same-origin non-browser request

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    throw new Error('Origine de requête invalide');
  }

  const allowedOrigins = new Set<string>([
    ...getConfiguredOrigins(),
    ...getRequestHostOrigins(request),
  ]);

  if (allowedOrigins.size === 0) return;

  if (!allowedOrigins.has(normalizedOrigin)) {
    throw new Error('Origine de requête invalide');
  }
}
