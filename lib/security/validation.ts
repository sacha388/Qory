const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STRIPE_CHECKOUT_SESSION_REGEX = /^cs_(test|live)_[A-Za-z0-9]+$/;
const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const MAX_URL_LENGTH = 2048;
const ALLOWED_WEB_PORTS = new Set(['', '80', '443']);

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_REGEX.test(value.trim());
}

export function normalizeScanUrlInput(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('URL requise');
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('URL requise');
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    throw new Error('URL trop longue');
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('Format d’URL invalide');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Seules les URL HTTP/HTTPS sont autorisées');
  }

  if (!parsed.hostname) {
    throw new Error('Nom d’hôte URL manquant');
  }

  if (!ALLOWED_WEB_PORTS.has(parsed.port)) {
    throw new Error('Seuls les ports web standards (80/443) sont autorisés');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Les identifiants URL ne sont pas autorisés');
  }

  parsed.hash = '';

  return parsed.toString();
}

export function parseOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Payload JSON invalide');
  }
  return value as Record<string, unknown>;
}

export function isValidStripeCheckoutSessionId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 200 &&
    STRIPE_CHECKOUT_SESSION_REGEX.test(value)
  );
}

export function isValidEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (normalized.length < 5 || normalized.length > 254) {
    return false;
  }
  return EMAIL_REGEX.test(normalized);
}
