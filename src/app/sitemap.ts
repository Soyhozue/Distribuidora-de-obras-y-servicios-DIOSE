import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Generado en cada solicitud, no al compilar: si se pre-renderizara como
// estático necesitaría una base de datos real disponible durante `next
// build` (rompe CI sin credenciales de producción), y además reflejaría
// productos nuevos solo hasta el próximo despliegue.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://diosedistribuidora.com.mx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  });

  const productUrls = products.map((p) => ({
    url: `${BASE_URL}/producto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/catalogo`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/nosotros`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...productUrls,
  ];
}
