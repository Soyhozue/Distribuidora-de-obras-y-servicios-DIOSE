"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductIcon } from "@/components/icons";
import type { ManagedProduct } from "@/lib/data";

function StatusTag({ status }: { status: ManagedProduct["stockStatus"] }) {
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

export default function InventoryManager({ products }: { products: ManagedProduct[] }) {
  const router = useRouter();
  const [onlyLow, setOnlyLow] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const visible = useMemo(
    () => (onlyLow ? products.filter((p) => p.stockStatus !== "EN_STOCK") : products),
    [products, onlyLow]
  );

  async function saveStock(id: string) {
    const value = drafts[id];
    if (value === undefined) return;
    setSavingId(id);
    try {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(value) }),
      });
      router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center justify-between px-9 shrink-0">
        <div className="flex items-baseline gap-4">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Inventario</span>
          <span className="text-xs text-gray-400">{visible.length} productos</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          <span className="text-xs text-gray-600">Solo stock bajo / agotado</span>
        </label>
      </div>

      <div className="p-9">
        <div className="bg-white border border-diose-border overflow-hidden">
          <div className="min-w-[680px] overflow-x-auto">
            <div className="grid grid-cols-[52px_1fr_110px_120px_100px_140px] px-4 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black items-center gap-2">
              {["Img", "Producto", "Categoría", "Stock actual", "Estado", "Ajustar stock"].map((h) => (
                <span key={h} className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                  {h}
                </span>
              ))}
            </div>

            {visible.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[52px_1fr_110px_120px_100px_140px] px-4 py-2.5 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA]"
              >
                <div
                  className="w-10 h-10 bg-[#F0F0F0] flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundImage: "radial-gradient(#DCDCDC 1px,transparent 1px)", backgroundSize: "10px 10px" }}
                >
                  {p.images && p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ProductIcon icon={p.icon} size={16} />
                  )}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-diose-black">{p.name}</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">SKU-{p.sku}</div>
                </div>
                <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 inline-block w-fit">{p.category}</span>
                <span className="text-[13px] font-medium text-diose-black">{p.stock} uds</span>
                <StatusTag status={p.stockStatus} />
                <div className="flex gap-1.5 items-center">
                  <input
                    type="number"
                    min={0}
                    placeholder={String(p.stock)}
                    value={drafts[p.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                    className="w-16 border border-diose-border px-2 py-1.5 text-xs outline-none"
                  />
                  <button
                    onClick={() => saveStock(p.id)}
                    disabled={savingId === p.id || drafts[p.id] === undefined || drafts[p.id] === ""}
                    className="bg-diose-black hover:bg-diose-amber text-white px-3 py-1.5 text-[11px] font-medium cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    {savingId === p.id ? "..." : "Guardar"}
                  </button>
                </div>
              </div>
            ))}

            {visible.length === 0 && (
              <div className="px-4 py-10 text-center text-xs text-gray-400">No hay productos para mostrar.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
