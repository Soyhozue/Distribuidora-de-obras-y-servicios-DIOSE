"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Catches errors thrown by the root layout itself — src/app/error.tsx only
 * covers errors inside a page/segment, not the layout that wraps all of
 * them. Next.js requires this file to render its own <html>/<body> since it
 * replaces the root layout entirely when triggered.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-black">Algo salió mal</h1>
        <p className="mt-3 text-sm text-gray-500 max-w-sm">
          Ocurrió un error inesperado. Por favor recarga la página.
        </p>
      </body>
    </html>
  );
}
