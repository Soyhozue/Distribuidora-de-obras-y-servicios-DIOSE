import type { Metadata } from "next";
import { Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

const BASE_URL = "https://diose.vercel.app";

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
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
