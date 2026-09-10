import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://diosedistribuidora.com.mx";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/cuenta", "/checkout", "/carrito"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
