import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ProductCard from "@/components/ProductCard";
import HeroTitle from "@/components/HeroTitle";
import PromoSection from "@/components/PromoSection";
import RevealOnScroll from "@/components/RevealOnScroll";
import ScrewFinder from "@/components/ScrewFinder";
import { ProductIcon, TruckIcon, ShieldCheckIcon, HeadsetIcon, LockIcon } from "@/components/icons";
import { getCategoriesWithCounts, getFeaturedProducts, getPromoImages, getScrewFinderOptions, getSiteSettings, pickIcon } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, settings, promos, categories, screwOptions] = await Promise.all([
    getFeaturedProducts(),
    getSiteSettings(),
    getPromoImages(),
    getCategoriesWithCounts(),
    getScrewFinderOptions(),
  ]);
  const activeCategories = categories.filter((c) => c.count > 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO — compact strip, not a full-bleed banner; the store starts right below */}
      <section className="bg-diose-black px-6 md:px-20 py-7 md:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <HeroTitle
            title={settings.heroTitle.replace(/\n/g, " ")}
            highlight={settings.heroTitleHighlight}
            highlightColor={settings.heroTitleHighlightColor}
            className="font-heading text-white text-[26px] md:text-[32px] leading-[1.05] tracking-[0.02em]"
          />
          <div className="flex items-center gap-5">
            <p className="hidden lg:block text-[13px] text-white/50 font-light max-w-[220px] leading-snug">
              {settings.heroSubtitle}
            </p>
            <Link
              href={settings.heroCta1Link}
              className="bg-white hover:bg-diose-amber hover:text-white text-diose-black px-7 py-3.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-center cursor-pointer transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              {settings.heroCta1Label}
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — reinforces this is a real online store, not just a catalog page */}
      <section className="bg-white border-b border-diose-border-light px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <TrustBadge icon={<TruckIcon size={20} />} label={settings.aboutFeature2 || "Entrega rápida en Ciudad Juárez"} />
          <TrustBadge icon={<LockIcon size={20} />} label="Pago seguro con Mercado Pago" />
          <TrustBadge icon={<ShieldCheckIcon size={20} />} label={settings.aboutFeature1 || "Productos certificados de calidad"} />
          <TrustBadge icon={<HeadsetIcon size={20} />} label={settings.aboutFeature3 || "Atención personalizada"} />
        </div>
      </section>

      {/* CATEGORY TILES — the "shop by category" grid that reads as a real store front page */}
      {activeCategories.length > 0 && (
        <section className="bg-white px-6 md:px-20 pt-8 pb-3">
          <div className="max-w-7xl mx-auto">
            <div className="font-heading text-xl text-diose-black tracking-[0.04em] mb-4">
              COMPRAR POR CATEGOR&Iacute;A
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {activeCategories.map((cat, i) => (
                <RevealOnScroll key={cat.name} delay={i * 60}>
                  <Link
                    href={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col gap-3.5 bg-diose-gray hover:bg-white border border-transparent hover:border-diose-border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(7,7,7,0.1)] h-full"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                      <ProductIcon icon={pickIcon(cat.name)} size={18} strokeWidth={1.6} color="#1d5fb8" />
                    </div>
                    <span className="text-[13px] font-medium text-diose-black leading-tight">{cat.name}</span>
                  </Link>
                </RevealOnScroll>
              ))}
              <RevealOnScroll delay={activeCategories.length * 60}>
                <Link
                  href="/catalogo"
                  className="flex flex-col justify-between gap-3.5 bg-diose-amber hover:bg-diose-amber-dark rounded-lg p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(29,95,184,0.35)] h-full"
                >
                  <span className="text-[13px] font-semibold text-white leading-tight">Ver todo el cat&aacute;logo</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>
      )}

      <ScrewFinder options={screwOptions} />

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="bg-diose-gray px-6 md:px-20 py-8">
          <RevealOnScroll className="max-w-7xl mx-auto flex flex-col md:flex-row gap-5">
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
          </RevealOnScroll>
        </section>
      )}

      <PromoSection promos={promos} />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="shrink-0 w-9 h-9 rounded-full bg-diose-amber/10 flex items-center justify-center">{icon}</div>
      <span className="text-[12px] text-diose-black leading-tight">{label}</span>
    </div>
  );
}
