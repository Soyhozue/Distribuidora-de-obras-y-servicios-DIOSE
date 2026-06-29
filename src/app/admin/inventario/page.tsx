import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAllProducts, getOrders } from "@/lib/data";
import InventoryManager from "./InventoryManager";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [products, orders] = await Promise.all([getAllProducts(), getOrders()]);
  const lowStockCount = products.filter((p) => p.stockStatus !== "EN_STOCK").length;
  const pendingCount = orders.filter((o) => o.status === "PENDIENTE").length;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Inventario" pendingOrders={pendingCount} lowStockCount={lowStockCount} />
      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <InventoryManager products={products} />
      </div>
    </div>
  );
}
