import { getAllProducts, getOrders } from "@/lib/data";
import AdsManager from "./AdsManager";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const [products, orders] = await Promise.all([getAllProducts(), getOrders()]);
  const lowStockCount = products.filter((p) => p.stockStatus !== "EN_STOCK").length;
  const pendingCount = orders.filter((o) => o.status === "PENDIENTE").length;
  return <AdsManager products={products} pendingOrders={pendingCount} lowStockCount={lowStockCount} />;
}
