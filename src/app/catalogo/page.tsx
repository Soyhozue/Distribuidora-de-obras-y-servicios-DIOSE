import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CatalogoClient from "./CatalogoClient";
import { getAllProducts, getBrandsWithCounts, getCategoriesWithCounts, getCombos } from "@/lib/data";

export const dynamic = "force-dynamic";

const CATEGORY_SLUGS: Record<string, string> = {
  herramientas: "Herramientas",
  materiales: "Materiales",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const [products, categories, brands, combos, params] = await Promise.all([
    getAllProducts(),
    getCategoriesWithCounts(),
    getBrandsWithCounts(),
    getCombos(),
    searchParams,
  ]);

  const initialCategory = params.categoria ? CATEGORY_SLUGS[params.categoria] ?? null : null;
  const initialQuery = params.q ?? "";

  return (
    <div className="flex flex-col min-h-screen bg-diose-gray">
      <Navbar active="Catálogo" />
      <CatalogoClient
        products={products}
        categories={categories}
        brands={brands}
        combos={combos}
        initialCategory={initialCategory}
        initialQuery={initialQuery}
      />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
