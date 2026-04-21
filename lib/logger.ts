type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown> & {
  message: string;
  level?: LogLevel;
  timestamp?: string;
};

const SENSITIVE_KEYS = [
  'authorization',
  'token',
  'access_token',
  'accessToken',
  'session_id',
  'sessionId',
  'email',
];

function redactString(value: string): string {
  if (value.length <= 6) return '***';
  return `${value.slice(0, 3)}***${value.slice(-2)}`;
}

function sanitizeLogValue(key: string, value: unknown): unknown {
  if (value == null) return value;

  const lowerKey = key.toLowerCase();
  if (SENSITIVE_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey.toLowerCase()))) {
    if (typeof value === 'string') return redactString(value);
    return '***';
  }

  if (lowerKey === 'url' && typeof value === 'string') {
    try {
      const parsed = new URL(value);
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return value;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(key, item));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
      childKey,
      sanitizeLogValue(childKey, childValue),
    ]);
    return Object.fromEntries(entries);
  }

  return value;
}

function toLogLine(payload: LogPayload): string {
  const sanitizedEntries = Object.entries(payload).map(([key, value]) => [
    key,
    sanitizeLogValue(key, value),
  ]);
  const data = {
    timestamp:
      (sanitizeLogValue('timestamp', payload.timestamp) as string | undefined) ??
      new Date().toISOString(),
    level: (sanitizeLogValue('level', payload.level) as LogLevel | undefined) ?? 'info',
    ...Object.fromEntries(sanitizedEntries),
  };

  return JSON.stringify(data);
}

export function logInfo(message: string, fields: Record<string, unknown> = {}): void {
  console.log(toLogLine({ message, level: 'info', ...fields }));
}

export function logWarn(message: string, fields: Record<string, unknown> = {}): void {
  console.warn(toLogLine({ message, level: 'warn', ...fields }));
}

export function logError(message: string, fields: Record<string, unknown> = {}): void {
  console.error(toLogLine({ message, level: 'error', ...fields }));
}
