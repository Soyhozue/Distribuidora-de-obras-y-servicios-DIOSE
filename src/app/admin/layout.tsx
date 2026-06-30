import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

async function getBadgeCounts() {
  try {
    const [pendingOrders, lowStockCount] = await Promise.all([
      prisma.order.count({ where: { status: "PENDIENTE" } }),
      prisma.product.count({ where: { stockStatus: { in: ["STOCK_BAJO", "AGOTADO"] } } }),
    ]);
    return { pendingOrders, lowStockCount };
  } catch {
    return { pendingOrders: 0, lowStockCount: 0 };
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pendingOrders, lowStockCount } = await getBadgeCounts();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar pendingOrders={pendingOrders} lowStockCount={lowStockCount} />
      <div className="flex-1 bg-[#F2F2F2] flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
