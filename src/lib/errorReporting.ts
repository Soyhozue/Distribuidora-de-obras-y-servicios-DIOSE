/**
 * For errors that are caught and handled locally (so Next.js's
 * onRequestError instrumentation hook never sees them — see
 * src/instrumentation.ts) but are still worth knowing about in production:
 * webhook failures, background email sends, etc. Always logs to the
 * console; also reports to Sentry when SENTRY_DSN is configured.
 */
export async function reportError(context: string, error: unknown) {
  console.error(context, error);
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureException(error, { extra: { context } });
}
