import { getAllProducts, getSiteSettings } from "@/lib/data";
import AdsManager from "./AdsManager";

export const revalidate = 0;

export default async function AdminAdsPage() {
  const [products, settings] = await Promise.all([getAllProducts(), getSiteSettings()]);
  return (
    <AdsManager
      products={products}
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
