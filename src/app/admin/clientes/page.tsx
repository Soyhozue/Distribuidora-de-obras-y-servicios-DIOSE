import { getCustomers } from "@/lib/data";

export const revalidate = 60;

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center justify-between px-9 shrink-0">
        <div className="flex items-baseline gap-4">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Clientes</span>
          <span className="text-xs text-gray-400">{customers.length} registrados</span>
        </div>
      </div>

      <div className="p-9">
        <div className="bg-white border border-diose-border overflow-hidden">
          <div className="min-w-[700px] overflow-x-auto">
            <div className="grid grid-cols-[1fr_180px_140px_100px_120px] px-4 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black items-center gap-2">
              {["Cliente", "Contacto", "Registrado", "Pedidos", "Total gastado"].map((h) => (
                <span key={h} className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                  {h}
                </span>
              ))}
            </div>

            {customers.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_180px_140px_100px_120px] px-4 py-3 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA]"
              >
                <div>
                  <div className="text-[13px] font-medium text-diose-black">{c.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{c.email}</div>
                </div>
                <span className="text-xs text-gray-600">{c.phone || "—"}</span>
                <span className="text-xs text-gray-500">{c.createdAt}</span>
                <span className="text-[13px] font-medium text-diose-black">{c.orderCount}</span>
                <span className="text-[13px] font-semibold text-diose-amber">{formatPrice(c.totalSpent)}</span>
              </div>
            ))}

            {customers.length === 0 && (
              <div className="px-4 py-12 text-center text-xs text-gray-400">Todavía no hay clientes registrados.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
