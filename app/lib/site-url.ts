const FALLBACK_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? FALLBACK_SITE_URL;
  const trimmedUrl = rawUrl.trim();
  const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;

  try {
    const parsedUrl = new URL(normalizedUrl);
    return parsedUrl.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}
