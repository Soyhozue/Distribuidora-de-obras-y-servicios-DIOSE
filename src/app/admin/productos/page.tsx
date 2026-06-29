import AdminSidebar from "@/components/admin/AdminSidebar";
import { ProductIcon } from "@/components/icons";
import { getAllProducts } from "@/lib/data";
import type { Product } from "@/data/products";

export const dynamic = "force-dynamic";

function StatusTag({ status }: { status: Product["stockStatus"] }) {
  if (status === "AGOTADO") {
    return (
      <span className="text-[10px] bg-diose-danger/10 text-diose-danger border border-diose-danger/30 px-2 py-0.5 tracking-[0.07em] uppercase inline-block">
        Agotado
      </span>
    );
  }
  if (status === "STOCK_BAJO") {
    return (
      <span className="text-[10px] bg-diose-amber/10 text-diose-amber border border-diose-amber/40 px-2 py-0.5 tracking-[0.07em] uppercase inline-block">
        Stock bajo
      </span>
    );
  }
  return (
    <span className="text-[10px] bg-diose-success/10 text-diose-success border border-diose-success/25 px-2 py-0.5 tracking-[0.07em] uppercase inline-block">
      En stock
    </span>
  );
}

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Catálogo" />

      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <div className="h-14 bg-white border-b border-diose-border-light flex flex-wrap items-center justify-between gap-3 px-9 shrink-0 py-2">
          <div className="flex items-baseline gap-4">
            <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Catálogo</span>
            <span className="text-xs text-gray-400">{products.length} productos</span>
          </div>
          <div className="flex gap-3 items-center">
            <div className="border border-diose-border px-3.5 py-1.5 flex items-center gap-2 bg-[#FAFAFA] w-44">
              <span className="text-xs text-gray-400">Buscar productos...</span>
            </div>
            <div className="border border-diose-border px-3.5 py-1.5 text-xs text-gray-600 bg-white cursor-pointer">
              Categoría
            </div>
            <div className="border border-diose-border px-3.5 py-1.5 text-xs text-gray-600 bg-white cursor-pointer">
              Marca
            </div>
            <button className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-1.5 text-[13px] font-semibold tracking-[0.06em] cursor-pointer transition-colors">
              + Añadir producto
            </button>
          </div>
        </div>

        <div className="flex-1 p-9 pt-5 overflow-hidden">
          <div className="bg-white border border-diose-border overflow-hidden">
            <div className="min-w-[820px] overflow-x-auto">
              <div className="grid grid-cols-[36px_52px_1fr_110px_90px_80px_70px_110px_90px] px-4 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black items-center gap-2">
                <div className="w-3.5 h-3.5 border-[1.5px] border-gray-300" />
                {["Img", "Nombre / SKU", "Categoría", "Marca", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                  <span key={h} className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                    {h}
                  </span>
                ))}
              </div>

              {products.map((p) => (
                <div
                  key={p.id}
                  className={`grid grid-cols-[36px_52px_1fr_110px_90px_80px_70px_110px_90px] px-4 py-2.5 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA] cursor-pointer ${
                    p.stockStatus === "AGOTADO" ? "opacity-70" : ""
                  }`}
                >
                  <div className="w-3.5 h-3.5 border-[1.5px] border-gray-300" />
                  <div
                    className="w-10 h-10 bg-[#F0F0F0] flex items-center justify-center shrink-0"
                    style={{ backgroundImage: "radial-gradient(#DCDCDC 1px,transparent 1px)", backgroundSize: "10px 10px" }}
                  >
                    <ProductIcon icon={p.icon} size={16} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-diose-black">{p.name}</div>
                    <div className="text-[11px] text-gray-300 mt-0.5">SKU-{p.sku}</div>
                  </div>
                  <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 inline-block w-fit">
                    {p.category}
                  </span>
                  <span className="text-xs text-gray-600">{p.brand}</span>
                  <span className="text-[13px] font-semibold text-diose-black">
                    ${p.price.toLocaleString("es-MX")}
                    {p.unit && <span className="text-[10px] font-normal text-gray-400">{p.unit}</span>}
                  </span>
                  <span
                    className={`text-[13px] ${
                      p.stockStatus === "STOCK_BAJO"
                        ? "text-diose-amber font-medium"
                        : p.stockStatus === "AGOTADO"
                          ? "text-diose-danger font-semibold"
                          : "text-gray-700"
                    }`}
                  >
                    {p.stock} uds
                  </span>
                  <StatusTag status={p.stockStatus} />
                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-gray-600 underline cursor-pointer">Editar</span>
                    <span className="text-xs text-gray-300 cursor-pointer hover:text-diose-danger">✕</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <span className="text-xs text-gray-400">Mostrando {products.length} de {products.length} productos</span>
            <div className="flex gap-1 items-center">
              <div className="w-7 h-7 bg-diose-black flex items-center justify-center cursor-pointer">
                <span className="text-xs text-white font-medium">1</span>
              </div>
              <div className="w-7 h-7 border border-diose-border flex items-center justify-center cursor-pointer">
                <span className="text-xs text-gray-600">2</span>
              </div>
              <div className="w-7 h-7 border border-diose-border flex items-center justify-center cursor-pointer">
                <span className="text-xs text-gray-600">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
