import CatalogoClient from "./CatalogoClient";
import { getAllProducts, getBrandsWithCounts, getCategoriesWithCounts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const [products, categories, brands] = await Promise.all([
    getAllProducts(),
    getCategoriesWithCounts(),
    getBrandsWithCounts(),
  ]);

  return <CatalogoClient products={products} categories={categories} brands={brands} />;
}
