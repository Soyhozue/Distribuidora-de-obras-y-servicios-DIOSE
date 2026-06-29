import { getAllProducts } from "@/lib/data";
import AdsManager from "./AdsManager";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const products = await getAllProducts();
  return <AdsManager products={products} />;
}
