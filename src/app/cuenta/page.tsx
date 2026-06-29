import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { ORDERS, type OrderStatus } from "@/data/orders";

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Confirmado: "bg-diose-black text-white",
    Entregado: "border border-gray-700 text-gray-700",
    Pendiente: "bg-diose-amber text-white",
    Cancelado: "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`text-[10px] px-2.5 py-1 tracking-[0.08em] uppercase inline-block ${styles[status]}`}>
      {status}
    </span>
  );
}

const NAV_ITEMS = [
  { label: "Mis pedidos", active: true },
  { label: "Perfil" },
  { label: "Direcciones" },
  { label: "Configuración" },
];

export default function AccountPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-col md:flex-row flex-1">
        {/* SIDEBAR */}
        <aside className="w-full md:w-62 bg-[#F9F9F9] border-b md:border-b-0 md:border-r border-diose-border-light p-7 shrink-0">
          <div className="flex items-center gap-3.5 mb-9">
            <div className="w-12 h-12 bg-diose-black rounded-full flex items-center justify-center shrink-0">
              <span className="text-base font-semibold text-white">CM</span>
            </div>
            <div>
              <div className="text-sm font-medium text-diose-black">Carlos Mendoza</div>
              <div className="text-[11px] text-gray-400 mt-0.5">carlos.mendoza@example.com</div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer ${
                  item.active ? "bg-diose-black" : ""
                }`}
              >
                <span
                  className={`text-[13px] tracking-[0.04em] ${
                    item.active ? "text-white font-medium" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
            <div className="h-px bg-diose-border-light my-3" />
            <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer">
              <span className="text-[13px] text-gray-300 tracking-[0.04em]">Cerrar sesión</span>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-6 md:px-13 md:py-9 overflow-x-auto">
          <div className="mb-7">
            <h2 className="font-heading text-3xl text-diose-black tracking-[0.04em] mb-1">Mis pedidos</h2>
            <span className="text-xs text-gray-400 tracking-[0.04em]">Historial de compras</span>
          </div>

          <div className="min-w-[640px]">
            <div className="grid grid-cols-[80px_120px_1fr_100px_120px] border-b-2 border-diose-black pb-2.5">
              {["Pedido", "Fecha", "Productos", "Total", "Estado"].map((h) => (
                <span key={h} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                  {h}
                </span>
              ))}
            </div>

            {ORDERS.map((order) => (
              <div
                key={order.number}
                className={`grid grid-cols-[80px_120px_1fr_100px_120px] border-b border-gray-100 py-3.5 items-center ${
                  order.status === "Cancelado" ? "opacity-50" : ""
                }`}
              >
                <span className="text-[13px] font-semibold text-diose-black">{order.number}</span>
                <span className="text-[13px] text-gray-500">{order.date}</span>
                <span className="text-[13px] text-gray-500 truncate pr-4">{order.products}</span>
                <span className="text-[13px] font-semibold text-diose-black">{formatPrice(order.total)}</span>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
