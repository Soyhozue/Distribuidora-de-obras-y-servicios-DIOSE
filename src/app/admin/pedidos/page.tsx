import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getOrders } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDIENTE: "bg-diose-amber/10 text-diose-amber border border-diose-amber",
  CONFIRMADO: "bg-diose-black text-white",
  EN_CAMINO: "bg-gray-700 text-white",
  ENTREGADO: "border border-gray-600 text-gray-600",
  CANCELADO: "bg-gray-100 text-gray-400",
};

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

export default async function AdminOrdersPage() {
  const [orders, lowStockCount] = await Promise.all([
    getOrders(),
    prisma.product.count({ where: { stockStatus: { in: ["STOCK_BAJO", "AGOTADO"] } } }),
  ]);
  const pendingCount = orders.filter((o) => o.status === "PENDIENTE").length;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Pedidos" pendingOrders={pendingCount} lowStockCount={lowStockCount} />
      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9 shrink-0">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Pedidos</span>
        </div>
        <div className="p-9">
          <div className="bg-white border border-diose-border overflow-hidden">
            <div className="grid grid-cols-[80px_100px_1fr_100px_140px_80px] px-6 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black">
              {["#", "Fecha", "Cliente", "Total", "Estado", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                  {h}
                </span>
              ))}
            </div>
            {orders.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                Todavía no hay pedidos. Aparecerán aquí en cuanto un cliente compre en el sitio.
              </div>
            )}
            {orders.map((o) => (
              <div key={o.id} className="grid grid-cols-[80px_100px_1fr_100px_140px_80px] px-6 py-3 border-b border-gray-100 items-center">
                <span className="text-[13px] font-semibold text-diose-black">#{o.number}</span>
                <span className="text-xs text-gray-500">{o.date}</span>
                <span className="text-[13px] text-gray-700">{o.client}</span>
                <span className="text-[13px] font-semibold text-diose-black">{formatPrice(o.total)}</span>
                <span
                  className={`text-[10px] px-2.5 py-1 tracking-[0.08em] uppercase inline-block w-fit ${STATUS_STYLE[o.status]}`}
                >
                  {o.statusLabel}
                </span>
                <Link href={`/admin/pedidos/${o.id}`} className="text-xs text-gray-400 underline cursor-pointer">
                  Ver
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
