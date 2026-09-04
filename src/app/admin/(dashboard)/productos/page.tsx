import { getAllProducts, getCategoryOptions, getBrandOptions, getVariantGroups } from "@/lib/data";
import ProductsManager from "./ProductsManager";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories, brands, variantGroups] = await Promise.all([
    getAllProducts(),
    getCategoryOptions(),
    getBrandOptions(),
    getVariantGroups(),
  ]);

  return (
    <ProductsManager products={products} categories={categories} brands={brands} variantGroups={variantGroups} />
  );
}
