import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://diosedistribuidora.com.mx";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DIOSE | Materiales y Herramientas de Construcción · Ciudad Juárez",
    template: "%s | DIOSE",
  },
  description:
    "Distribuidora de materiales de construcción, herramientas y suministros en Ciudad Juárez, Chihuahua. Envíos rápidos, precios competitivos.",
  keywords: ["materiales de construcción", "herramientas", "Ciudad Juárez", "ferretería", "DIOSE", "Chihuahua"],
  authors: [{ name: "DIOSE" }],
  creator: "DIOSE",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: BASE_URL,
    siteName: "DIOSE",
    title: "DIOSE | Materiales y Herramientas de Construcción",
    description:
      "Distribuidora de materiales de construcción, herramientas y suministros en Ciudad Juárez, Chihuahua.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "DIOSE Materiales de Construcción" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DIOSE | Materiales y Herramientas de Construcción",
    description: "Distribuidora de materiales y herramientas en Ciudad Juárez.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading the nonce here (set by proxy.ts alongside the CSP header) is
  // what tells Next.js to tag its own inline/chunk scripts with it — without
  // this the CSP silently blocks every script Next injects, breaking all
  // client-side JS on the site. Not read below; just calling headers() is
  // enough (Next's documented CSP-with-nonce recipe).
  void (await headers()).get("x-nonce");

  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastProvider />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
