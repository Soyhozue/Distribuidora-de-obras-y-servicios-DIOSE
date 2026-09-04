import { getPromoImages, getPromoSectionLabels, getSiteSettings, parseHeroSlides } from "@/lib/data";
import SettingsManager from "./SettingsManager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, promos, sectionLabels] = await Promise.all([
    getSiteSettings(),
    getPromoImages(),
    getPromoSectionLabels(),
  ]);
  const heroSlides = parseHeroSlides(settings.heroSlides);

  return (
    <SettingsManager settings={settings} heroSlides={heroSlides} promos={promos} sectionLabels={sectionLabels} />
  );
}
