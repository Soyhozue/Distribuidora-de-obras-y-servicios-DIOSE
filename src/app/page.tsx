import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import HeroTitle from "@/components/HeroTitle";
import PromoSection from "@/components/PromoSection";
import { CATEGORIES } from "@/data/products";
import { getFeaturedProducts, getPromoImages, getSiteSettings, parseHeroSlides } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, settings, promos] = await Promise.all([
    getFeaturedProducts(),
    getSiteSettings(),
    getPromoImages(),
  ]);
  const heroSlides = parseHeroSlides(settings.heroSlides);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-diose-black overflow-hidden">
        <HeroCarousel slides={heroSlides} />
        <div className="relative z-10 px-6 md:px-20 py-16 md:py-24 max-w-3xl">
          <div className="w-12 h-0.5 bg-diose-amber mb-3" />
          <div className="text-[11px] text-white/50 tracking-[0.2em] uppercase mb-2.5">{settings.heroEyebrow}</div>
          <HeroTitle
            title={settings.heroTitle}
            highlight={settings.heroTitleHighlight}
            className="font-heading text-white text-[56px] md:text-[86px] leading-[0.9] tracking-[0.02em]"
          />
          <p className="text-[15px] text-white/60 font-light mt-3.5 mb-6 max-w-md leading-relaxed">
            {settings.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href={settings.heroCta1Link}
              className="bg-white text-diose-black px-10 py-3.5 text-[13px] font-semibold tracking-[0.1em] uppercase cursor-pointer"
            >
              {settings.heroCta1Label}
            </Link>
            <Link
              href={settings.heroCta2Link}
              className="border border-diose-amber/60 text-diose-amber px-10 py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase cursor-pointer"
            >
              {settings.heroCta2Label}
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      <section className="bg-white border-b border-diose-border-light px-6 md:px-20 py-5 flex flex-wrap items-center gap-4">
        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 whitespace-nowrap">
          Categorías
        </span>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat, i) => (
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

      {/* FEATURED PRODUCTS */}
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

      <PromoSection promos={promos} />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
