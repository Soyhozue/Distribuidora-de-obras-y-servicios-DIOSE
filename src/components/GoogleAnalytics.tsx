import Script from "next/script";

/**
 * No-op until NEXT_PUBLIC_GA_MEASUREMENT_ID is set (create a free account at
 * analytics.google.com, add this site, copy the "G-XXXXXXX" measurement ID).
 * The scripts below get the same per-request nonce Next.js applies to its
 * own injected scripts (see proxy.ts's CSP), so they aren't blocked despite
 * the strict script-src.
 */
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
