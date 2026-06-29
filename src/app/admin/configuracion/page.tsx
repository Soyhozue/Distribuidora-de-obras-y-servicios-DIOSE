import AdminSidebar from "@/components/admin/AdminSidebar";
import { getPromoImages, getSiteSettings, parseHeroSlides } from "@/lib/data";
import SettingsManager from "./SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, promos] = await Promise.all([getSiteSettings(), getPromoImages()]);
  const heroSlides = parseHeroSlides(settings.heroSlides);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Configuración" />
      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <SettingsManager settings={settings} heroSlides={heroSlides} promos={promos} />
      </div>
    </div>
  );
}
