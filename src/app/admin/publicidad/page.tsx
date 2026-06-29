import { getAllProducts, getOrders, getSiteSettings } from "@/lib/data";
import AdsManager from "./AdsManager";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const [products, orders, settings] = await Promise.all([getAllProducts(), getOrders(), getSiteSettings()]);
  const lowStockCount = products.filter((p) => p.stockStatus !== "EN_STOCK").length;
  const pendingCount = orders.filter((o) => o.status === "PENDIENTE").length;
  return (
    <AdsManager
      products={products}
      pendingOrders={pendingCount}
      lowStockCount={lowStockCount}
      settings={{
        phone: settings.phone,
        phone2: settings.phone2,
        address: settings.address,
        whatsapp: settings.whatsapp,
        partnerLogoUrl: settings.partnerLogoUrl,
        partnerName: settings.partnerName,
      }}
    />
  );
}
