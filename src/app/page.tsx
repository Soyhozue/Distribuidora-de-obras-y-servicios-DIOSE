import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import HeroTitle from "@/components/HeroTitle";
import PromoSection from "@/components/PromoSection";
import RevealOnScroll from "@/components/RevealOnScroll";
import ScrewFinder from "@/components/ScrewFinder";
import {
  ProductIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeadsetIcon,
  LockIcon,
  BoltIcon,
  SafetyHelmetIcon,
  TireWrenchIcon,
  SealantGunIcon,
  SprayCanIcon,
  PlumbingWrenchIcon,
} from "@/components/icons";
import { getCategoriesWithCounts, getFeaturedProducts, getPromoImages, getScrewFinderOptions, getSiteSettings, parseHeroSlides, pickIcon } from "@/lib/data";

export const dynamic = "force-dynamic";

// Acentos multicolor del rediseño — mismo tono/saturación en oklch, cada uno
// con su tinte claro (fondos de chip) y su tinta oscura (texto/ícono sobre el tinte).
const HUES = [
  { solid: "var(--color-diose-red)", tint: "var(--color-diose-red-tint)", ink: "var(--color-diose-red-ink)" },
  { solid: "var(--color-diose-gold)", tint: "var(--color-diose-gold-tint)", ink: "var(--color-diose-gold-ink)" },
  { solid: "var(--color-diose-blue)", tint: "var(--color-diose-blue-tint)", ink: "var(--color-diose-blue-ink)" },
  { solid: "var(--color-diose-green)", tint: "var(--color-diose-green-tint)", ink: "var(--color-diose-green-ink)" },
  { solid: "var(--color-diose-purple)", tint: "var(--color-diose-purple-tint)", ink: "var(--color-diose-purple-ink)" },
];

// Ilustraciones a color para las categorías del catálogo — cada una dibujada
// con la paleta real del objeto (casco amarillo, tornillo cromado, etc.) en
// vez de un ícono genérico tintado de un solo color.
const CATEGORY_ILLUSTRATIONS: { match: RegExp; Icon: (props: { size?: number }) => React.ReactElement }[] = [
  { match: /tornill/i, Icon: BoltIcon },
  { match: /seguridad/i, Icon: SafetyHelmetIcon },
  { match: /desponche|llanta/i, Icon: TireWrenchIcon },
  { match: /impermeabiliz|sellad/i, Icon: SealantGunIcon },
  { match: /pintura|aerosol/i, Icon: SprayCanIcon },
  { match: /plomer/i, Icon: PlumbingWrenchIcon },
];

function pickCategoryIllustration(name: string) {
  return CATEGORY_ILLUSTRATIONS.find((c) => c.match.test(name))?.Icon ?? null;
}

export default async function Home() {
  const [featured, settings, promos, categories, screwOptions] = await Promise.all([
    getFeaturedProducts(),
    getSiteSettings(),
    getPromoImages(),
    getCategoriesWithCounts(),
    getScrewFinderOptions(),
  ]);
  const heroSlides = parseHeroSlides(settings.heroSlides);
  const activeCategories = categories.filter((c) => c.count > 0);

  // Foto real para el panel derecho del hero — una promo ya subida, o si no
  // hay, otra de las mismas fotos del carrusel principal.
  const sidePhoto =
    promos.find((p) => p.mediaType === "IMAGE")?.imageUrl ?? heroSlides[1]?.url ?? heroSlides[0]?.url ?? null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO — bento: carrusel de fotos reales + panel de promo con foto */}
      <section className="px-4 md:px-6 pt-2 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
          <RevealOnScroll className="relative rounded-3xl overflow-hidden min-h-[360px] md:min-h-[440px] bg-diose-black">
            <HeroCarousel slides={heroSlides} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 md:p-9 z-10">
              <HeroTitle
                title={settings.heroTitle.replace(/\n/g, " ")}
                highlight={settings.heroTitleHighlight}
                highlightColor={settings.heroTitleHighlightColor}
                className="font-heading text-white text-[28px] md:text-[40px] leading-[1.08] mb-3"
              />
              <p className="text-[13.5px] text-white/70 max-w-[420px] leading-relaxed mb-5">
                {settings.heroSubtitle}
              </p>
              <Link
                href={settings.heroCta1Link}
                className="inline-block bg-white hover:bg-diose-gray text-diose-black px-7 py-3 rounded-2xl text-[12px] font-bold tracking-[0.08em] uppercase transition-colors duration-200"
              >
                {settings.heroCta1Label}
              </Link>
            </div>
          </RevealOnScroll>

          <RevealOnScroll
            delay={80}
            className="relative rounded-3xl overflow-hidden min-h-[360px] md:min-h-[440px] bg-diose-blue"
          >
            {sidePhoto && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sidePhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-diose-blue/95 via-diose-blue/50 to-diose-blue/20" />
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 p-7 md:p-9 z-10">
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-white/75 block mb-3">
                {settings.heroEyebrow}
              </span>
              <div className="font-heading text-[22px] leading-tight text-white mb-5">
                {[settings.aboutHeroLine1, settings.aboutHeroLine2, settings.aboutHeroLine3].join(" ")}
              </div>
              <Link
                href={settings.heroCta2Link}
                className="inline-block bg-white text-diose-blue px-5 py-3 rounded-2xl text-xs font-bold tracking-[0.04em]"
              >
                {settings.heroCta2Label}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* TRUST STRIP — cada tarjeta con su propio acento de color */}
      <section className="px-4 md:px-6 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: TruckIcon, label: settings.aboutFeature2 || "Entrega rápida en Ciudad Juárez" },
            { icon: LockIcon, label: "Pago seguro con Mercado Pago" },
            { icon: ShieldCheckIcon, label: settings.aboutFeature1 || "Productos certificados de calidad" },
            { icon: HeadsetIcon, label: settings.aboutFeature3 || "Atención personalizada" },
          ].map(({ icon: Icon, label }, i) => {
            const hue = HUES[i % HUES.length];
            return <TrustBadge key={label} icon={<Icon size={18} strokeWidth={1.6} color={hue.solid} />} label={label} />;
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS — subido justo después del hero para que se vean rápido */}
      {featured.length > 0 && (
        <section className="px-4 md:px-6 pb-8">
          <RevealOnScroll className="max-w-7xl mx-auto">
            <div className="flex justify-between items-baseline mb-4">
              <div className="font-heading text-xl text-diose-black">Destacados de la semana</div>
              <Link href="/catalogo" className="text-xs font-semibold text-diose-blue">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </RevealOnScroll>
        </section>
      )}

      {/* CATEGORÍAS — fotos reales de producto, con un acento de color distinto por categoría */}
      {activeCategories.length > 0 && (
        <section className="px-4 md:px-6 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="font-heading text-xl text-diose-black mb-4">Comprar por categoría</div>
            <div className="flex flex-wrap gap-3.5">
              {activeCategories.map((cat, i) => {
                const hue = HUES[i % HUES.length];
                const Illustration = pickCategoryIllustration(cat.name);
                return (
                  <RevealOnScroll key={cat.name} delay={i * 60}>
                    <Link
                      href={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
                      className="group flex flex-col items-center gap-2 w-24 cursor-pointer"
                    >
                      <div
                        className="relative w-16 h-16 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-110 bg-white"
                        style={{ boxShadow: `0 0 0 2.5px #fff, 0 0 0 4.5px ${hue.solid}` }}
                      >
                        {Illustration ? (
                          <div className="w-full h-full flex items-center justify-center p-2.5">
                            <Illustration size={40} />
                          </div>
                        ) : cat.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cat.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: hue.tint }}>
                            <ProductIcon icon={pickIcon(cat.name)} size={22} strokeWidth={1.6} color={hue.ink} />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-diose-black text-center leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  </RevealOnScroll>
                );
              })}
              <RevealOnScroll delay={activeCategories.length * 60}>
                <Link href="/catalogo" className="group flex flex-col items-center gap-2 w-24 cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-diose-black flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-diose-black text-center leading-tight">Ver todo</span>
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>
      )}

      <ScrewFinder options={screwOptions} />

      <PromoSection promos={promos} />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-diose-border-light rounded-2xl px-4 py-3.5">
      <div className="shrink-0 w-9 h-9 rounded-full bg-diose-gray flex items-center justify-center">{icon}</div>
      <span className="text-[12px] font-semibold text-diose-black leading-tight">{label}</span>
    </div>
  );
}
