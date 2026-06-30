"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import ConfirmModal from "@/components/ConfirmModal";

const STATUSES = [
  { key: "PENDIENTE", label: "Pendiente" },
  { key: "CONFIRMADO", label: "Confirmado" },
  { key: "EN_CAMINO", label: "Enviado" },
  { key: "ENTREGADO", label: "Entregado" },
];

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_CAMINO: "Enviado / En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default function OrderStatusPanel({
  orderId,
  initialStatus,
  initialNotes,
  initialNotify,
  customerPhone,
  orderNumber,
}: {
  orderId: string;
  initialStatus: string;
  initialNotes: string;
  initialNotify: boolean;
  customerPhone?: string;
  orderNumber?: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [notify, setNotify] = useState(initialNotify);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes: notes, notifyWhatsapp: notify }),
      });
      router.refresh();

      // Abrir WhatsApp con mensaje pre-llenado si notify está activado
      if (notify && customerPhone) {
        const phone = customerPhone.replace(/\D/g, "");
        const msg = encodeURIComponent(
          `Hola 👋 Te informamos que tu pedido #${orderNumber ?? ""} de DIOSE ha sido actualizado.\n\nEstado actual: *${STATUS_LABELS[status] ?? status}*\n\nGracias por tu compra 🙌`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeOrder() {
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    router.push("/admin/pedidos");
  }

  return (
    <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-diose-border-light shrink-0 p-7 flex flex-col gap-5 overflow-y-auto">
      <div>
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3.5">
          Actualizar estado
        </div>
        <div className="flex flex-col gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-left ${
                status === s.key ? "border-[1.5px] border-diose-amber bg-diose-amber/5" : "border border-diose-border"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                  status === s.key ? "bg-diose-amber" : "border-[1.5px] border-gray-300"
                }`}
              >
                {status === s.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className={`text-[13px] ${status === s.key ? "font-medium text-diose-amber" : "text-gray-600"}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
          Notas internas
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-diose-border p-3 h-22 text-[13px] text-gray-700 outline-none resize-none"
        />
      </div>

      <div>
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
          Notificar al cliente
        </div>
        <button
          onClick={() => setNotify((v) => !v)}
          className="flex items-center gap-2.5 px-4 py-3 border border-diose-border cursor-pointer w-full"
        >
          <WhatsAppIcon size={14} color="#555" />
          <span className="text-[13px] text-gray-600">Enviar actualización por WhatsApp</span>
          <div className={`ml-auto w-9 h-5 rounded-full relative transition-colors ${notify ? "bg-diose-black" : "bg-gray-200"}`}>
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                notify ? "right-0.5" : "left-0.5"
              }`}
            />
          </div>
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <button
          onClick={save}
          disabled={saving}
          className="bg-diose-amber hover:bg-diose-amber-dark text-white p-3.5 text-center cursor-pointer transition-colors disabled:opacity-50"
        >
          <span className="text-[13px] font-semibold tracking-[0.1em] uppercase">
            {saving ? "Guardando..." : "Guardar cambios"}
          </span>
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="border border-diose-border-light p-3 text-center cursor-pointer flex items-center justify-center gap-1.5 hover:bg-red-50"
        >
          <span className="text-xs text-diose-danger tracking-[0.04em]">Eliminar pedido</span>
        </button>
      </div>
      {confirmDelete && (
        <ConfirmModal
          message="¿Eliminar este pedido? No se puede deshacer."
          onConfirm={() => { setConfirmDelete(false); removeOrder(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
