import { env } from './env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = logLevels[env.LOG_LEVEL] ?? 1;

function sanitize(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (['password', 'passwordHash', 'token', 'refreshToken', 'tokenHash', 'secret'].includes(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function formatMessage(level: LogLevel, message: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  const logObject = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(meta ? { meta: sanitize(meta) } : {}),
  };

  if (env.NODE_ENV === 'development') {
    const metaStr = meta ? ` | ${JSON.stringify(sanitize(meta))}` : '';
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
  } else {
    console.log(JSON.stringify(logObject));
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => {
    if (currentLevel <= logLevels.debug) formatMessage('debug', message, meta);
  },
  info: (message: string, meta?: unknown) => {
    if (currentLevel <= logLevels.info) formatMessage('info', message, meta);
  },
  warn: (message: string, meta?: unknown) => {
    if (currentLevel <= logLevels.warn) formatMessage('warn', message, meta);
  },
  error: (message: string, meta?: unknown) => {
    if (currentLevel <= logLevels.error) formatMessage('error', message, meta);
  },
};
