import type { ErrorEvent, Event } from "@sentry/nextjs";

const scrubbedKeys = new Set([
  "email",
  "ip_address",
  "username",
  "name",
  "authorization",
  "cookie",
  "set-cookie"
]);

function scrubObject(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubObject(item));
  }

  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(record)) {
    if (scrubbedKeys.has(key.toLowerCase())) {
      continue;
    }

    next[key] = scrubObject(item);
  }

  return next;
}

export function getSentryEnvironment() {
  return (
    process.env.SENTRY_ENVIRONMENT?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim() ||
    (process.env.NODE_ENV === "production" ? "production" : "development")
  );
}

export function getSentryRelease() {
  return (
    process.env.SENTRY_RELEASE?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_RELEASE?.trim() ||
    process.env.npm_package_version?.trim() ||
    undefined
  );
}

export function getSentryDsn(client = false) {
  if (client) {
    return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";
  }

  return process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";
}

export function isSentryEnabled(client = false) {
  return Boolean(getSentryDsn(client));
}

export function scrubSentryEvent<T extends Event>(event: T) {
  if (event.user) {
    event.user = scrubObject(event.user) as typeof event.user;
  }

  if (event.request) {
    event.request = scrubObject(event.request) as typeof event.request;
  }

  if (event.contexts) {
    event.contexts = scrubObject(event.contexts) as typeof event.contexts;
  }

  return event;
}

export function getSharedSentryOptions(client = false) {
  const dsn = getSentryDsn(client);

  return {
    dsn,
    enabled: Boolean(dsn),
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend(event: ErrorEvent) {
      return scrubSentryEvent(event);
    }
  };
}
