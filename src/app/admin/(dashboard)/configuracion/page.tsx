import { getAllProducts, getPromoImages, getPromoSectionLabels, getSiteSettings, parseHeroSlides } from "@/lib/data";
import SettingsManager from "./SettingsManager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, promos, sectionLabels, products] = await Promise.all([
    getSiteSettings(),
    getPromoImages(),
    getPromoSectionLabels(),
    getAllProducts(),
  ]);
  const heroSlides = parseHeroSlides(settings.heroSlides);

  return (
    <SettingsManager
      settings={settings}
      heroSlides={heroSlides}
      promos={promos}
      sectionLabels={sectionLabels}
      products={products}
    />
  );
}
