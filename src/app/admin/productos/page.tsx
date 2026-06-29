import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAllProducts, getCategoryOptions, getBrandOptions } from "@/lib/data";
import ProductsManager from "./ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([
    getAllProducts(),
    getCategoryOptions(),
    getBrandOptions(),
  ]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Catálogo" />
      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <ProductsManager products={products} categories={categories} brands={brands} />
      </div>
    </div>
  );
}
