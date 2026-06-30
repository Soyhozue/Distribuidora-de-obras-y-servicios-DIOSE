import { getAllProducts, getCategoryOptions, getBrandOptions } from "@/lib/data";
import ProductsManager from "./ProductsManager";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([
    getAllProducts(),
    getCategoryOptions(),
    getBrandOptions(),
  ]);

  return <ProductsManager products={products} categories={categories} brands={brands} />;
}
