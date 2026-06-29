import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/data/products";

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-diose-black overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(5,5,5,.93) 32%, rgba(5,5,5,.6) 70%, rgba(5,5,5,.38) 100%), url('/images/hero-warehouse.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 42%",
          }}
        />
        <div className="relative z-10 px-6 md:px-20 py-16 md:py-24 max-w-3xl">
          <div className="w-12 h-0.5 bg-diose-amber mb-3" />
          <div className="text-[11px] text-white/50 tracking-[0.2em] uppercase mb-2.5">
            Ciudad Juárez · 8 años de experiencia
          </div>
          <h1 className="font-heading text-white text-[56px] md:text-[86px] leading-[0.9] tracking-[0.02em]">
            CONSTRUYE
            <br />
            <span className="text-diose-amber">LO QUE</span>
            <br />
            IMAGINAS
          </h1>
          <p className="text-[15px] text-white/60 font-light mt-3.5 mb-6 max-w-md leading-relaxed">
            Materiales de construcción, herramientas profesionales y suministros para cada obra en Ciudad
            Juárez.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/catalogo"
              className="bg-white text-diose-black px-10 py-3.5 text-[13px] font-semibold tracking-[0.1em] uppercase cursor-pointer"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/nosotros"
              className="border border-diose-amber/60 text-diose-amber px-10 py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase cursor-pointer"
            >
              Quiénes somos
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

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
