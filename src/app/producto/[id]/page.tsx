import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ProductCard from "@/components/ProductCard";
import ProductPurchasePanel from "./ProductPurchasePanel";
import ProductGallery from "./ProductGallery";
import { getProductById, getRelatedProducts, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  return {
    title: `${product.name} | DIOSE`,
    description: product.description ?? `Compra ${product.name} en DIOSE. ${product.brand} · ${product.category}`,
    openGraph: {
      title: product.name,
      description: product.description ?? `${product.brand} · ${product.category}`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id);
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar active="Catálogo" />

      <div className="flex flex-col md:flex-row flex-1">
        {/* LEFT: DARK VISUAL PANEL */}
        <div
          className="relative md:w-[46%] shrink-0 bg-diose-black flex flex-col items-center justify-center p-9 md:p-0 md:min-h-[560px]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="absolute top-7 left-9 hidden md:flex items-center gap-2">
            <Link href="/catalogo" className="text-[11px] text-white/35 tracking-[0.04em]">
              Catálogo
            </Link>
            <span className="text-[11px] text-white/20">/</span>
            <Link
              href={`/catalogo?categoria=${encodeURIComponent(product.category)}`}
              className="text-[11px] text-white/35 tracking-[0.04em]"
            >
              {product.category}
            </Link>
            <span className="text-[11px] text-white/20">/</span>
            <span className="text-[11px] text-white/60">{product.name}</span>
          </div>

          <ProductGallery product={product} />

          <div className="absolute bottom-7 left-9 hidden md:block">
            <span className="text-[10px] tracking-[0.14em] uppercase text-white/28 border border-white/12 px-3 py-1.5">
              {product.category}
            </span>
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO PANEL */}
        <div className="flex-1 p-8 md:p-10 flex flex-col">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-2.5">
            {product.brand} · SKU-{product.sku}
          </div>
          <h1 className="font-heading text-3xl md:text-[40px] text-diose-black tracking-[0.02em] leading-[0.95] mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl font-semibold text-diose-amber">{formatPrice(product.price)}</span>
            {product.stockStatus !== "AGOTADO" ? (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-diose-amber rounded-full" />
                <span className="text-xs font-medium text-diose-black tracking-[0.04em]">
                  En stock — {product.stock} unidades
                </span>
              </div>
            ) : (
              <span className="text-xs font-medium text-diose-danger tracking-[0.04em]">Agotado</span>
            )}
          </div>

          <div className="h-px bg-diose-border-light mb-4" />

          <p className="text-sm text-gray-600 font-light leading-relaxed mb-5 max-w-lg">
            {product.description || "Producto disponible en nuestro catálogo. Contáctanos para más detalles técnicos o cotización personalizada."}
          </p>

          {product.specs && (
            <div className="grid grid-cols-2 gap-0 mb-5 border border-diose-border-light">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div
                  key={key}
                  className={`p-3 border-diose-border-light ${i % 2 === 0 ? "border-r" : ""} border-b`}
                >
                  <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">
                    {key}
                  </div>
                  <div className="text-[13px] font-medium text-diose-black">{value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <ProductPurchasePanel product={product} whatsapp={settings.whatsapp} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="px-6 md:px-12 py-10 border-t border-diose-border-light">
          <div className="font-heading text-2xl text-diose-black tracking-[0.04em] mb-5">
            Productos relacionados
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
