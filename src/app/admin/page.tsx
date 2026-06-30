import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { getOrders } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

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

export default async function AdminDashboardPage() {
  const [orders, productCount, lowStockCount, lowStockProductsCount] = await Promise.all([
    getOrders(),
    prisma.product.count(),
    prisma.product.count({ where: { stockStatus: "STOCK_BAJO" } }),
    prisma.product.count({ where: { stockStatus: { in: ["STOCK_BAJO", "AGOTADO"] } } }),
  ]);

  const pendingCount = orders.filter((o) => o.status === "PENDIENTE").length;
  const monthRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: "Total de pedidos", value: String(orders.length), hint: `${pendingCount} pendientes`, dark: false },
    { label: "Ingresos totales", value: formatPrice(monthRevenue), hint: "Todos los pedidos", dark: true },
    { label: "Productos activos", value: String(productCount), hint: `${lowStockCount} con stock bajo`, dark: false },
    { label: "Pedidos pendientes", value: String(pendingCount), hint: "Requieren atención", dark: false },
  ];

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center justify-between px-9 shrink-0">
        <div className="flex items-baseline gap-4">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Dashboard</span>
        </div>
        <div className="border border-diose-border px-3.5 py-1.5 flex items-center gap-2 bg-[#FAFAFA]">
          <SearchIcon size={13} color="#999" />
          <span className="text-xs text-gray-400">Buscar...</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-9 pb-0 shrink-0">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`p-6 border ${s.dark ? "bg-diose-black border-diose-black" : "bg-white border-diose-border"}`}
          >
            <div className={`text-[10px] font-semibold tracking-[0.14em] uppercase mb-3 ${s.dark ? "text-white/45" : "text-gray-400"}`}>
              {s.label}
            </div>
            <div className={`font-heading text-4xl md:text-5xl tracking-[0.02em] ${s.dark ? "text-white" : "text-diose-black"}`}>
              {s.value}
            </div>
            <div className={`text-[11px] mt-1.5 ${s.dark ? "text-white/35" : "text-gray-400"}`}>{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="m-9 bg-white border border-diose-border flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-diose-border-light flex justify-between items-center">
          <span className="text-[13px] font-semibold text-diose-black tracking-[0.04em]">Pedidos recientes</span>
          <Link href="/admin/pedidos" className="text-xs text-gray-400 underline cursor-pointer tracking-[0.04em]">
            Ver todos
          </Link>
        </div>
        <div className="min-w-[640px] overflow-x-auto">
          <div className="grid grid-cols-[80px_100px_1fr_100px_140px_80px] px-6 py-2.5 bg-[#F9F9F9] border-b border-diose-border-light">
            {["#", "Fecha", "Cliente", "Total", "Estado", ""].map((h) => (
              <span key={h} className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                {h}
              </span>
            ))}
          </div>
          {recentOrders.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-gray-400">Todavía no hay pedidos.</div>
          )}
          {recentOrders.map((o) => (
            <div key={o.id} className="grid grid-cols-[80px_100px_1fr_100px_140px_80px] px-6 py-3 border-b border-gray-100 items-center">
              <span className="text-[13px] font-semibold text-diose-black">#{o.number}</span>
              <span className="text-xs text-gray-500">{o.date}</span>
              <span className="text-[13px] text-gray-700">{o.client}</span>
              <span className="text-[13px] font-semibold text-diose-black">{formatPrice(o.total)}</span>
              <span className={`text-[10px] px-2.5 py-1 tracking-[0.08em] uppercase inline-block w-fit ${STATUS_STYLE[o.status]}`}>
                {o.statusLabel}
              </span>
              <Link href={`/admin/pedidos/${o.id}`} className="text-xs text-gray-400 underline cursor-pointer">
                Ver
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
