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

function parseDescription(raw: string | null | undefined) {
  if (!raw) return { main: "", benefits: [], applications: [], characteristics: [] };

  const lower = raw.toLowerCase();

  const BENEFIT_RE = /\.\s*(beneficios)\s+/i;
  const APP_RE = /\.\s*(aplicaciones)\s+/i;
  const SPEC_RE = /\.\s*(especificaciones)\s+/i;

  const markerBenef = lower.indexOf("[beneficios]");
  const markerApp   = lower.indexOf("[aplicaciones]");
  const markerChar  = lower.indexOf("[especificaciones-lista]");

  const naturalBenef = BENEFIT_RE.exec(raw);
  const naturalApp   = APP_RE.exec(raw);
  const naturalSpec  = SPEC_RE.exec(raw);

  const benefIdx = markerBenef !== -1 ? markerBenef : (naturalBenef ? naturalBenef.index + 1 : -1);
  const appIdx   = markerApp   !== -1 ? markerApp   : (naturalApp   ? naturalApp.index   + 1 : -1);
  const specIdx  = naturalSpec ? naturalSpec.index + 1 : -1;
  const charIdx  = markerChar  !== -1 ? markerChar  : -1;

  const markers = [benefIdx, appIdx, specIdx, charIdx].filter((i) => i !== -1);
  const firstMarker = markers.length ? Math.min(...markers) : Infinity;

  const main = firstMarker !== Infinity ? raw.slice(0, firstMarker).trim() : raw.trim();

  function extractBlock(startIdx: number, markerLen: number, others: number[]): string {
    const start = startIdx + markerLen;
    const nextMarker = others.filter((i) => i > startIdx).sort((a, b) => a - b)[0] ?? raw!.length;
    return raw!.slice(start, nextMarker).trim();
  }

  let benefits: string[] = [];
  let applications: string[] = [];
  let characteristics: string[] = [];

  if (benefIdx !== -1) {
    const markerLen = markerBenef !== -1 ? "[beneficios]".length : (naturalBenef ? naturalBenef[0].length - 1 : 0);
    const block = extractBlock(benefIdx, markerLen, [appIdx, specIdx, charIdx].filter((i) => i !== -1));
    benefits = block.split(/[\n.]+/).map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter((l) => l.length > 4);
  }

  if (appIdx !== -1) {
    const markerLen = markerApp !== -1 ? "[aplicaciones]".length : (naturalApp ? naturalApp[0].length - 1 : 0);
    const block = extractBlock(appIdx, markerLen, [benefIdx, specIdx, charIdx].filter((i) => i !== -1));
    applications = block.split(/[\n.]+/).map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter((l) => l.length > 4);
  }

  if (charIdx !== -1) {
    const block = extractBlock(charIdx, "[especificaciones-lista]".length, [benefIdx, appIdx, specIdx].filter((i) => i !== -1));
    characteristics = block.split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter((l) => l.length > 2);
  }

  return { main, benefits, applications, characteristics };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id);
  const settings = await getSiteSettings();
  const { main, benefits, applications, characteristics } = parseDescription(product.description);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar active="Catálogo" />

      {/* BREADCRUMB */}
      <div className="px-6 md:px-12 py-3 border-b border-diose-border-light flex items-center gap-2">
        <Link href="/catalogo" className="text-[11px] text-gray-400 hover:text-diose-black tracking-[0.04em]">
          Catálogo
        </Link>
        <span className="text-[11px] text-gray-300">/</span>
        <Link
          href={`/catalogo?categoria=${encodeURIComponent(product.category)}`}
          className="text-[11px] text-gray-400 hover:text-diose-black tracking-[0.04em]"
        >
          {product.category}
        </Link>
        <span className="text-[11px] text-gray-300">/</span>
        <span className="text-[11px] text-diose-black font-medium">{product.name}</span>
      </div>

      {/* MAIN PRODUCT LAYOUT */}
      <div className="flex flex-col md:flex-row flex-1 px-6 md:px-12 py-8 gap-10 max-w-7xl mx-auto w-full">

        {/* LEFT: GALLERY */}
        <div className="md:w-[46%] shrink-0">
          <ProductGallery product={product} />
          <div className="mt-4 flex flex-col gap-4">
            <span className="text-[10px] tracking-[0.14em] uppercase text-gray-400 border border-diose-border-light px-3 py-1.5 self-start">
              {product.category}
            </span>
            {characteristics.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">
                  Especificaciones
                </div>
                <ul className="flex flex-col gap-1.5">
                  {characteristics.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-diose-black shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className="flex-1 flex flex-col">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-2.5">
            {product.brand} · SKU-{product.sku}
          </div>
          <h1 className="font-heading text-3xl md:text-[40px] text-diose-black tracking-[0.02em] leading-[0.95] mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-5">
            <span className="text-2xl font-semibold text-diose-amber">{formatPrice(product.price)}</span>
            {product.stockStatus !== "AGOTADO" ? (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-medium text-gray-600 tracking-[0.04em]">
                  En stock — {product.stock} unidades
                </span>
              </div>
            ) : (
              <span className="text-xs font-medium text-diose-danger tracking-[0.04em]">Agotado</span>
            )}
          </div>

          <div className="h-px bg-diose-border-light mb-5" />

          {/* PURCHASE PANEL */}
          <ProductPurchasePanel product={product} whatsapp={settings.whatsapp} />

          <div className="h-px bg-diose-border-light mt-6 mb-6" />

          {/* DESCRIPTION */}
          {main && (
            <div className="mb-6">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">
                Descripción
              </div>
              <p className="text-sm text-gray-600 font-light leading-relaxed">{main}</p>
            </div>
          )}

          {/* BENEFITS */}
          {benefits.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">
                Beneficios
              </div>
              <ul className="flex flex-col gap-1.5">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-diose-amber shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* APPLICATIONS */}
          {applications.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">
                Aplicaciones
              </div>
              <div className="flex flex-wrap gap-2">
                {applications.map((a, i) => (
                  <span key={i} className="text-xs border border-diose-border-light px-3 py-1.5 text-gray-600">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SPECS */}
          {product.specs && Object.keys(product.specs as object).length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">
                Especificaciones
              </div>
              <div className="border border-diose-border-light">
                {Object.entries(product.specs as Record<string, unknown>).map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex gap-4 px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <span className="font-medium text-diose-black w-36 shrink-0">{key}</span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!main && benefits.length === 0 && applications.length === 0 && (
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Contáctanos para más detalles técnicos o cotización personalizada.
            </p>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="px-6 md:px-12 py-10 border-t border-diose-border-light mt-4">
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

      <div className="mt-10">
        <Footer />
      </div>
      <WhatsAppFloat />
    </div>
  );
}
