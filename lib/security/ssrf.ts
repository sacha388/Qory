import dns from 'dns/promises';
import net from 'net';
import { normalizeScanUrlInput } from '@/lib/security/validation';

const MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 10_000;
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata',
  'metadata.aws.internal',
]);
const BLOCKED_HOST_SUFFIXES = ['.local', '.internal', '.localhost'];

function ipv4ToInt(ip: string): number {
  return ip
    .split('.')
    .map((segment) => Number(segment))
    .reduce((acc, part) => (acc << 8) + part, 0) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  const inRange = (start: string, end: string) => {
    const startValue = ipv4ToInt(start);
    const endValue = ipv4ToInt(end);
    return value >= startValue && value <= endValue;
  };

  return (
    inRange('0.0.0.0', '0.255.255.255') ||
    inRange('10.0.0.0', '10.255.255.255') ||
    inRange('100.64.0.0', '100.127.255.255') ||
    inRange('127.0.0.0', '127.255.255.255') ||
    inRange('169.254.0.0', '169.254.255.255') ||
    inRange('172.16.0.0', '172.31.255.255') ||
    inRange('192.0.0.0', '192.0.0.255') ||
    inRange('192.168.0.0', '192.168.255.255') ||
    inRange('198.18.0.0', '198.19.255.255') ||
    inRange('224.0.0.0', '255.255.255.255')
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // ULA fc00::/7
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true; // link-local fe80::/10
  }

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.replace('::ffff:', '');
    if (net.isIP(mapped) === 4) {
      return isPrivateIPv4(mapped);
    }
  }

  return false;
}

function assertPublicIp(ip: string) {
  const version = net.isIP(ip);
  if (version === 4 && isPrivateIPv4(ip)) {
    throw new Error('Target resolves to a private IPv4 address');
  }

  if (version === 6 && isPrivateIPv6(ip)) {
    throw new Error('Target resolves to a private IPv6 address');
  }

  if (version === 0) {
    throw new Error('Resolved host is not a valid IP address');
  }
}

async function assertResolvableToPublicAddresses(hostname: string): Promise<void> {
  const lowerHostname = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(lowerHostname)) {
    throw new Error('Blocked hostname');
  }
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => lowerHostname.endsWith(suffix))) {
    throw new Error('Blocked hostname');
  }

  const directIpVersion = net.isIP(hostname);
  if (directIpVersion) {
    assertPublicIp(hostname);
    return;
  }

  const firstLookup = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!firstLookup.length) {
    throw new Error('Hostname did not resolve to any address');
  }

  for (const record of firstLookup) {
    assertPublicIp(record.address);
  }

  // Best-effort anti DNS-rebinding: reject unstable hostnames that resolve
  // to different address sets within the same request lifecycle.
  const secondLookup = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!secondLookup.length) {
    throw new Error('Hostname did not resolve to any address');
  }

  const firstSet = new Set(firstLookup.map((record) => record.address).sort());
  const secondSet = new Set(secondLookup.map((record) => record.address).sort());

  for (const record of secondLookup) {
    assertPublicIp(record.address);
  }

  if (firstSet.size !== secondSet.size) {
    throw new Error('Hostname resolution is unstable');
  }
  for (const address of firstSet) {
    if (!secondSet.has(address)) {
      throw new Error('Hostname resolution is unstable');
    }
  }
}

function isRedirectStatus(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      redirect: 'manual',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function assertSafeExternalUrl(rawUrl: string): Promise<string> {
  const normalized = normalizeScanUrlInput(rawUrl);
  const parsed = new URL(normalized);

  await assertResolvableToPublicAddresses(parsed.hostname);

  return normalized;
}

export async function safeFetchUrl(
  rawUrl: string,
  init?: RequestInit,
  options: { timeoutMs?: number; maxRedirects?: number } = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;

  let current = await assertSafeExternalUrl(rawUrl);
  const visited = new Set<string>([current]);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetchWithTimeout(current, init ?? {}, timeoutMs);

    if (!isRedirectStatus(response.status)) {
      return response;
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Redirect location missing');
    }

    const next = new URL(location, current).toString();
    const safeNext = await assertSafeExternalUrl(next);

    if (visited.has(safeNext)) {
      throw new Error('Redirect loop detected');
    }

    visited.add(safeNext);
    current = safeNext;
  }

  throw new Error('Too many redirects');
}

export type ReadTextWithLimitResult = {
  text: string;
  truncated: boolean;
  totalBytes: number;
};

export type ReadBytesWithLimitResult = {
  bytes: Uint8Array;
  truncated: boolean;
  totalBytes: number;
};

export async function readTextWithLimit(
  response: Response,
  maxBytes: number,
  options: { truncate?: boolean } = {}
): Promise<ReadTextWithLimitResult> {
  const shouldTruncate = options.truncate === true;
  const contentLength = response.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes && !shouldTruncate) {
    throw new Error('Response payload too large');
  }

  if (!response.body) {
    const text = await response.text();
    const size = Buffer.byteLength(text, 'utf8');
    if (size > maxBytes) {
      if (!shouldTruncate) {
        throw new Error('Response payload too large');
      }

      return {
        text: Buffer.from(text, 'utf8').subarray(0, maxBytes).toString('utf8'),
        truncated: true,
        totalBytes: size,
      };
    }

    return {
      text,
      truncated: false,
      totalBytes: size,
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (!value) continue;

    const nextTotalBytes = totalBytes + value.byteLength;
    if (nextTotalBytes > maxBytes) {
      if (!shouldTruncate) {
        await reader.cancel('response-too-large');
        throw new Error('Response payload too large');
      }

      const remainingBytes = Math.max(0, maxBytes - totalBytes);
      if (remainingBytes > 0) {
        text += decoder.decode(value.subarray(0, remainingBytes), { stream: true });
      }
      totalBytes = nextTotalBytes;
      await reader.cancel('response-truncated');
      text += decoder.decode();
      return {
        text,
        truncated: true,
        totalBytes,
      };
    }

    totalBytes = nextTotalBytes;
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return {
    text,
    truncated: false,
    totalBytes,
  };
}

export async function readBytesWithLimit(
  response: Response,
  maxBytes: number,
  options: { truncate?: boolean } = {}
): Promise<ReadBytesWithLimitResult> {
  const shouldTruncate = options.truncate === true;
  const contentLength = response.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes && !shouldTruncate) {
    throw new Error('Response payload too large');
  }

  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) {
      if (!shouldTruncate) {
        throw new Error('Response payload too large');
      }

      return {
        bytes: bytes.slice(0, maxBytes),
        truncated: true,
        totalBytes: bytes.byteLength,
      };
    }

    return {
      bytes,
      truncated: false,
      totalBytes: bytes.byteLength,
    };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (!value) continue;

    const nextTotalBytes = totalBytes + value.byteLength;
    if (nextTotalBytes > maxBytes) {
      if (!shouldTruncate) {
        await reader.cancel('response-too-large');
        throw new Error('Response payload too large');
      }

      const remainingBytes = Math.max(0, maxBytes - totalBytes);
      if (remainingBytes > 0) {
        chunks.push(value.slice(0, remainingBytes));
      }
      totalBytes = nextTotalBytes;
      await reader.cancel('response-truncated');
      return {
        bytes: concatUint8Arrays(chunks),
        truncated: true,
        totalBytes,
      };
    }

    totalBytes = nextTotalBytes;
    chunks.push(value);
  }

  return {
    bytes: concatUint8Arrays(chunks),
    truncated: false,
    totalBytes,
  };
}

function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  if (chunks.length === 0) {
    return new Uint8Array();
  }

  if (chunks.length === 1) {
    return chunks[0];
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}
