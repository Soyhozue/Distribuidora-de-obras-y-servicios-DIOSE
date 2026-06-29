import AdminSidebar from "@/components/admin/AdminSidebar";
import { getPromoImages, getSiteSettings } from "@/lib/data";
import SettingsManager from "./SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, promos] = await Promise.all([getSiteSettings(), getPromoImages()]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Configuración" />
      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <SettingsManager settings={settings} promos={promos} />
      </div>
    </div>
  );
}
