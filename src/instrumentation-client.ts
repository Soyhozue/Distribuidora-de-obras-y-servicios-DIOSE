import * as Sentry from "@sentry/nextjs";

/**
 * Browser-side error reporting — only active if NEXT_PUBLIC_SENTRY_DSN is
 * set (same DSN as SENTRY_DSN, just exposed to the client bundle). See
 * src/instrumentation.ts for the server-side counterpart.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}
