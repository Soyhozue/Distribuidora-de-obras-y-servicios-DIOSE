"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};

function formatPrice(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

export default function ClientesManager({ customers: initial }: { customers: Customer[] }) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initial);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function remove(id: string) {
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

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
            <div className="grid grid-cols-[1fr_180px_140px_100px_120px_40px] px-4 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black items-center gap-2">
              {["Cliente", "Contacto", "Registrado", "Pedidos", "Total gastado", ""].map((h, i) => (
                <span key={i} className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400">{h}</span>
              ))}
            </div>

            {customers.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_180px_140px_100px_120px_40px] px-4 py-3 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA]"
              >
                <div>
                  <div className="text-[13px] font-medium text-diose-black">{c.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{c.email}</div>
                </div>
                <span className="text-xs text-gray-600">{c.phone || "—"}</span>
                <span className="text-xs text-gray-500">{c.createdAt}</span>
                <span className="text-[13px] font-medium text-diose-black">{c.orderCount}</span>
                <span className="text-[13px] font-semibold text-diose-amber">{formatPrice(c.totalSpent)}</span>
                <button
                  onClick={() => setConfirmId(c.id)}
                  className="text-gray-300 hover:text-diose-danger text-xs cursor-pointer transition-colors"
                  title="Eliminar cliente"
                >
                  ✕
                </button>
              </div>
            ))}

            {customers.length === 0 && (
              <div className="px-4 py-12 text-center text-xs text-gray-400">Todavía no hay clientes registrados.</div>
            )}
          </div>
        </div>
      </div>

      {confirmId && (
        <ConfirmModal
          message="¿Eliminar este cliente? Se eliminarán también sus direcciones guardadas."
          onConfirm={() => { const id = confirmId; setConfirmId(null); remove(id); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}
