import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import HeroTitle from "@/components/HeroTitle";
import PromoSection from "@/components/PromoSection";
import { getCategoriesWithCounts, getFeaturedProducts, getPromoImages, getSiteSettings, parseHeroSlides } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, settings, promos, categories] = await Promise.all([
    getFeaturedProducts(),
    getSiteSettings(),
    getPromoImages(),
    getCategoriesWithCounts(),
  ]);
  const heroSlides = parseHeroSlides(settings.heroSlides);
  const activeCategories = categories.filter((c) => c.count > 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-diose-black overflow-hidden min-h-[420px] md:min-h-0 aspect-[3/4] md:aspect-[29/10]">
        <HeroCarousel slides={heroSlides} />
        <div className="relative z-10 h-full flex flex-col justify-end md:justify-center px-5 md:px-20 pb-10 md:pb-0 max-w-3xl">
          <div className="w-10 h-0.5 bg-diose-amber mb-3" />
          <div
            className="text-[10px] text-white/80 tracking-[0.2em] uppercase mb-2"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
          >
            {settings.heroEyebrow}
          </div>
          <HeroTitle
            title={settings.heroTitle}
            highlight={settings.heroTitleHighlight}
            highlightColor={settings.heroTitleHighlightColor}
            className="font-heading text-white text-[42px] md:text-[86px] leading-[0.9] tracking-[0.02em]"
          />
          <p
            className="text-[13px] md:text-[15px] text-white/80 font-light mt-3 mb-5 max-w-sm md:max-w-md leading-relaxed"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
          >
            {settings.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <Link
              href={settings.heroCta1Link}
              className="bg-white hover:bg-diose-amber hover:text-white text-diose-black px-8 py-3.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-center cursor-pointer transition-colors duration-200"
            >
              {settings.heroCta1Label}
            </Link>
            <Link
              href={settings.heroCta2Link}
              className="bg-white/15 hover:bg-white/30 border border-white/80 text-white px-8 py-3.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-center cursor-pointer transition-colors duration-200 backdrop-blur-sm"
            >
              {settings.heroCta2Label}
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      {activeCategories.length > 0 && (
        <section className="bg-white border-b border-diose-border-light px-6 md:px-20 py-5 flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 whitespace-nowrap">
            Categorías
          </span>
          <div className="flex flex-wrap gap-1">
            {activeCategories.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
                className={`px-6 py-2.5 text-[13px] tracking-[0.04em] cursor-pointer ${
                  i === 0 ? "bg-diose-amber text-white font-medium" : "border border-diose-border text-gray-700"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="bg-diose-gray px-6 md:px-20 py-8">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="md:min-w-[140px]">
              <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-500 mb-1.5">
                Destacados
              </div>
              <div className="font-heading text-3xl text-diose-black leading-tight tracking-[0.04em]">
                Selección
                <br />
                del mes
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 flex-1">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <PromoSection promos={promos} />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
