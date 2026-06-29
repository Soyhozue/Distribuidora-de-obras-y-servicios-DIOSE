import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

const ORDERS = [
  { id: "2048", date: "28 Jun", client: "Carlos Mendoza", total: "$5,010", status: "Confirmado", style: "bg-diose-black text-white" },
  { id: "2047", date: "27 Jun", client: "Ana Torres", total: "$1,340", status: "Enviado", style: "bg-gray-700 text-white" },
  { id: "2046", date: "27 Jun", client: "Rodrigo Nava", total: "$620", status: "Pendiente", style: "bg-diose-amber/10 text-diose-amber border border-diose-amber" },
  { id: "2045", date: "26 Jun", client: "María Pérez", total: "$3,200", status: "Entregado", style: "border border-gray-600 text-gray-600" },
  { id: "2044", date: "26 Jun", client: "Luis Guzmán", total: "$890", status: "Cancelado", style: "bg-gray-100 text-gray-400" },
];

export default function AdminOrdersPage() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Pedidos" />
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
            {ORDERS.map((o) => (
              <div key={o.id} className="grid grid-cols-[80px_100px_1fr_100px_140px_80px] px-6 py-3 border-b border-gray-100 items-center">
                <span className="text-[13px] font-semibold text-diose-black">{o.id}</span>
                <span className="text-xs text-gray-500">{o.date}</span>
                <span className="text-[13px] text-gray-700">{o.client}</span>
                <span className="text-[13px] font-semibold text-diose-black">{o.total}</span>
                <span className={`text-[10px] px-2.5 py-1 tracking-[0.08em] uppercase inline-block w-fit ${o.style}`}>
                  {o.status}
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
