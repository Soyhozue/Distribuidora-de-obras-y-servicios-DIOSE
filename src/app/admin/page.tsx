import AdminSidebar from "@/components/admin/AdminSidebar";
import { SearchIcon } from "@/components/icons";

const STATS = [
  { label: "Pedidos hoy", value: "14", hint: "+3 vs. ayer", dark: false },
  { label: "Ingresos del mes", value: "$184,500", hint: "MXN · Junio 2026", dark: true },
  { label: "Productos activos", value: "145", hint: "3 con stock bajo", dark: false },
  { label: "Pedidos pendientes", value: "7", hint: "Requieren atención", dark: false },
];

const RECENT_ORDERS = [
  { id: "2048", date: "28 Jun", client: "Carlos Mendoza", total: "$5,010", status: "Confirmado", style: "bg-diose-black text-white" },
  { id: "2047", date: "27 Jun", client: "Ana Torres", total: "$1,340", status: "Enviado", style: "bg-gray-700 text-white" },
  { id: "2046", date: "27 Jun", client: "Rodrigo Nava", total: "$620", status: "Pendiente", style: "bg-diose-amber/10 text-diose-amber border border-diose-amber" },
  { id: "2045", date: "26 Jun", client: "María Pérez", total: "$3,200", status: "Entregado", style: "border border-gray-600 text-gray-600" },
  { id: "2044", date: "26 Jun", client: "Luis Guzmán", total: "$890", status: "Cancelado", style: "bg-gray-100 text-gray-400", muted: true },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Dashboard" />

      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <div className="h-14 bg-white border-b border-diose-border-light flex items-center justify-between px-9 shrink-0">
          <div className="flex items-baseline gap-4">
            <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Dashboard</span>
            <span className="text-xs text-gray-400 tracking-[0.04em]">Hoy, 28 de junio 2026</span>
          </div>
          <div className="border border-diose-border px-3.5 py-1.5 flex items-center gap-2 bg-[#FAFAFA]">
            <SearchIcon size={13} color="#999" />
            <span className="text-xs text-gray-400">Buscar...</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-9 pb-0 shrink-0">
          {STATS.map((s) => (
            <div
              key={s.label}
              className={`p-6 border ${s.dark ? "bg-diose-black border-diose-black" : "bg-white border-diose-border"}`}
            >
              <div
                className={`text-[10px] font-semibold tracking-[0.14em] uppercase mb-3 ${
                  s.dark ? "text-white/45" : "text-gray-400"
                }`}
              >
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
            <span className="text-xs text-gray-400 underline cursor-pointer tracking-[0.04em]">Ver todos</span>
          </div>
          <div className="min-w-[640px] overflow-x-auto">
            <div className="grid grid-cols-[80px_100px_1fr_100px_140px_80px] px-6 py-2.5 bg-[#F9F9F9] border-b border-diose-border-light">
              {["#", "Fecha", "Cliente", "Total", "Estado", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                  {h}
                </span>
              ))}
            </div>
            {RECENT_ORDERS.map((o) => (
              <div
                key={o.id}
                className={`grid grid-cols-[80px_100px_1fr_100px_140px_80px] px-6 py-3 border-b border-gray-100 items-center ${
                  o.muted ? "opacity-50" : ""
                }`}
              >
                <span className="text-[13px] font-semibold text-diose-black">{o.id}</span>
                <span className="text-xs text-gray-500">{o.date}</span>
                <span className="text-[13px] text-gray-700">{o.client}</span>
                <span className="text-[13px] font-semibold text-diose-black">{o.total}</span>
                <span className={`text-[10px] px-2.5 py-1 tracking-[0.08em] uppercase inline-block w-fit ${o.style}`}>
                  {o.status}
                </span>
                <span className="text-xs text-gray-400 underline cursor-pointer">Ver</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
