import crypto from 'crypto';
import type { NextRequest } from 'next/server';

const TOKEN_VERSION = 'v1';
const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const SHARE_TOKEN_VERSION = 'sv1';
const SHARE_TOKEN_PURPOSE_REPORT_VIEW = 'report:view';
const DEFAULT_SHARE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const COOKIE_PREFIX = 'qory_audit_';

type AuditTokenPayload = {
  auditId: string;
  exp: number;
};

type AuditShareTokenPayload = {
  auditId: string;
  exp: number;
  purpose: typeof SHARE_TOKEN_PURPOSE_REPORT_VIEW;
};

function getAuditAccessSecret(): string {
  const configured = process.env.AUDIT_ACCESS_SECRET;
  if (configured && configured.trim().length >= 32) {
    return configured;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'test-only-audit-access-secret-change-me';
  }

  throw new Error('Missing AUDIT_ACCESS_SECRET (min 32 chars)');
}

function sign(data: string): string {
  return crypto
    .createHmac('sha256', getAuditAccessSecret())
    .update(data)
    .digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function issueAuditAccessToken(
  auditId: string,
  ttlSeconds: number = DEFAULT_TOKEN_TTL_SECONDS
): string {
  const payload: AuditTokenPayload = {
    auditId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(`${TOKEN_VERSION}.${encodedPayload}`);

  return `${TOKEN_VERSION}.${encodedPayload}.${signature}`;
}

export function verifyAuditAccessToken(token: string, auditId: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [version, encodedPayload, signature] = parts;
  if (version !== TOKEN_VERSION || !encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = sign(`${version}.${encodedPayload}`);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as AuditTokenPayload;

    if (!payload || payload.auditId !== auditId) return false;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export function issueAuditShareToken(
  auditId: string,
  ttlSeconds: number = DEFAULT_SHARE_TOKEN_TTL_SECONDS
): string {
  const payload: AuditShareTokenPayload = {
    auditId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    purpose: SHARE_TOKEN_PURPOSE_REPORT_VIEW,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(`${SHARE_TOKEN_VERSION}.${encodedPayload}`);

  return `${SHARE_TOKEN_VERSION}.${encodedPayload}.${signature}`;
}

export function verifyAuditShareToken(token: string, auditId: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [version, encodedPayload, signature] = parts;
  if (version !== SHARE_TOKEN_VERSION || !encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = sign(`${version}.${encodedPayload}`);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as AuditShareTokenPayload;

    if (!payload || payload.auditId !== auditId) return false;
    if (payload.purpose !== SHARE_TOKEN_PURPOSE_REPORT_VIEW) return false;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export function extractAuditAccessTokenFromRequest(
  request: NextRequest,
  bodyToken?: unknown,
  auditId?: string
): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const fromHeader = authHeader.slice('Bearer '.length).trim();
    if (fromHeader) return fromHeader;
  }

  const fromCustomHeader = request.headers.get('x-audit-token')?.trim();
  if (fromCustomHeader) return fromCustomHeader;

  const fromQuery = new URL(request.url).searchParams.get('t')?.trim();
  if (fromQuery) return fromQuery;

  if (typeof bodyToken === 'string' && bodyToken.trim()) {
    return bodyToken.trim();
  }

  if (auditId) {
    const fromCookie = request.cookies.get(getAuditAccessCookieName(auditId))?.value?.trim();
    if (fromCookie) return fromCookie;
  }

  return null;
}

export function extractAuditShareTokenFromRequest(request: NextRequest): string | null {
  const fromCustomHeader = request.headers.get('x-share-token')?.trim();
  if (fromCustomHeader) return fromCustomHeader;

  const fromQuery = new URL(request.url).searchParams.get('st')?.trim();
  if (fromQuery) return fromQuery;

  return null;
}

export function appendTokenToPath(path: string, token: string): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}t=${encodeURIComponent(token)}`;
}

export function appendShareTokenToPath(path: string, token: string): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}st=${encodeURIComponent(token)}`;
}

export function getAuditAccessCookieName(auditId: string): string {
  return `${COOKIE_PREFIX}${auditId}`;
}

export function getAuditAccessTokenTtlSeconds(): number {
  return DEFAULT_TOKEN_TTL_SECONDS;
}

export function getAuditShareTokenTtlSeconds(): number {
  return DEFAULT_SHARE_TOKEN_TTL_SECONDS;
}
