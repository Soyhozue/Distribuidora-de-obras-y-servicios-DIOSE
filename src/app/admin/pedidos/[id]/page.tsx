import AdminSidebar from "@/components/admin/AdminSidebar";
import OrderStatusPanel from "./OrderStatusPanel";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Pedidos" />

      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9 gap-5 shrink-0">
          <span className="text-xs text-gray-400 tracking-[0.04em] cursor-pointer">← Pedidos</span>
          <span className="text-xs text-gray-300">/</span>
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Pedido #{id}</span>
          <span className="text-xs text-gray-400">· Rodrigo Nava · 27 Jun 2026</span>
          <div className="ml-auto">
            <span className="text-[10px] bg-diose-amber/10 text-diose-amber border border-diose-amber px-3 py-1 tracking-[0.1em] uppercase">
              Pendiente
            </span>
          </div>
        </div>

        {/* Status progress track */}
        <div className="bg-white border-b border-diose-border-light px-9 py-5 shrink-0">
          <div className="flex items-center max-w-2xl">
            {["Pendiente", "Confirmado", "Enviado", "Entregado"].map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      i === 0 ? "bg-diose-amber" : "border-2 border-gray-200"
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-white" : "bg-gray-200"}`} />
                  </div>
                  <span className={`text-[11px] tracking-[0.04em] ${i === 0 ? "font-semibold text-diose-amber" : "text-gray-300"}`}>
                    {step}
                  </span>
                </div>
                {i < 3 && <div className="flex-1 h-0.5 bg-gray-200 -mt-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT */}
          <div className="flex-1 p-9 flex flex-col gap-5 overflow-y-auto">
            <div className="bg-white border border-diose-border p-6">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3.5">
                Información del cliente
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Nombre" value="Rodrigo Nava" />
                <Field label="Teléfono" value="+52 656 987-6543" />
                <Field label="Correo" value="rodrigo.nava@example.com" />
                <Field label="Dirección" value="Blvd. Díaz Ordaz 456, Col. Rincón del Sol" />
              </div>
            </div>

            <div className="bg-white border border-diose-border overflow-hidden">
              <div className="px-6 py-3.5 border-b border-gray-100 text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                Productos del pedido
              </div>
              <OrderLine name="Llave Inglesa 12&quot;" brand="STANLEY" sku="STN-LI12" qty={1} price="$340" amber />
              <OrderLine name="Cemento Portland 50 kg" brand="HOLCIM" sku="HLM-C50" qty={1} price="$280" />
              <div className="bg-[#F9F9F9] px-6 py-3 border-t border-diose-border-light flex justify-between items-center">
                <span className="text-xs text-gray-400">Total del pedido</span>
                <span className="text-lg font-semibold text-diose-black">$620</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <OrderStatusPanel />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-300 mb-1">{label}</div>
      <div className="text-sm text-diose-black">{value}</div>
    </div>
  );
}

function OrderLine({
  name,
  brand,
  sku,
  qty,
  price,
  amber,
}: {
  name: string;
  brand: string;
  sku: string;
  qty: number;
  price: string;
  amber?: boolean;
}) {
  return (
    <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-50 last:border-b-0">
      <div
        className="w-13 h-13 bg-[#F0F0F0] shrink-0 flex items-center justify-center"
        style={{ backgroundImage: "radial-gradient(#DCDCDC 1px,transparent 1px)", backgroundSize: "10px 10px" }}
      />
      <div className="flex-1">
        <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-300 mb-1">{brand}</div>
        <div className="text-sm font-medium text-diose-black">{name}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          SKU-{sku} · Cantidad: {qty}
        </div>
      </div>
      <div className={`text-base font-semibold ${amber ? "text-diose-amber" : "text-diose-black"}`}>{price}</div>
    </div>
  );
}
