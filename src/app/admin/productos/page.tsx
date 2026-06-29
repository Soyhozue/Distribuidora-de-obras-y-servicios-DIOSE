import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAllProducts, getCategoryOptions, getBrandOptions, getOrders } from "@/lib/data";
import ProductsManager from "./ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, brands, orders] = await Promise.all([
    getAllProducts(),
    getCategoryOptions(),
    getBrandOptions(),
    getOrders(),
  ]);
  const lowStockCount = products.filter((p) => p.stockStatus !== "EN_STOCK").length;
  const pendingCount = orders.filter((o) => o.status === "PENDIENTE").length;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Catálogo" pendingOrders={pendingCount} lowStockCount={lowStockCount} />
      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <ProductsManager products={products} categories={categories} brands={brands} />
      </div>
    </div>
  );
}
