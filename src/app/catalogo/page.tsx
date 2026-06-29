import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CatalogoClient from "./CatalogoClient";
import { getAllProducts, getBrandsWithCounts, getCategoriesWithCounts } from "@/lib/data";

export const dynamic = "force-dynamic";

const CATEGORY_SLUGS: Record<string, string> = {
  herramientas: "Herramientas",
  materiales: "Materiales",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const [products, categories, brands, params] = await Promise.all([
    getAllProducts(),
    getCategoriesWithCounts(),
    getBrandsWithCounts(),
    searchParams,
  ]);

  const initialCategory = params.categoria ? CATEGORY_SLUGS[params.categoria] ?? null : null;

  return (
    <div className="flex flex-col min-h-screen bg-diose-gray">
      <Navbar active={initialCategory ?? "Catálogo"} />
      <CatalogoClient products={products} categories={categories} brands={brands} initialCategory={initialCategory} />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
