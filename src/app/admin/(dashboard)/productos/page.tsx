import { getAllProducts, getCategoryOptions, getBrandOptions, getVariantGroups, getSubcategories } from "@/lib/data";
import ProductsManager from "./ProductsManager";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories, brands, variantGroups, subcategories] = await Promise.all([
    getAllProducts(),
    getCategoryOptions(),
    getBrandOptions(),
    getVariantGroups(),
    getSubcategories(),
  ]);

  return (
    <ProductsManager
      products={products}
      categories={categories}
      brands={brands}
      variantGroups={variantGroups}
      subcategories={subcategories}
    />
  );
}
