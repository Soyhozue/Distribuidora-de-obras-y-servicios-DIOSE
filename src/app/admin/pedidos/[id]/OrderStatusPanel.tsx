"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";

const STATUSES = ["Pendiente", "Confirmado", "Enviado", "Entregado"];

export default function OrderStatusPanel() {
  const [status, setStatus] = useState("Pendiente");
  const [notes, setNotes] = useState("Cliente requiere entrega entre 9am y 12pm...");
  const [notify, setNotify] = useState(false);

  return (
    <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-diose-border-light shrink-0 p-7 flex flex-col gap-5 overflow-y-auto">
      <div>
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3.5">
          Actualizar estado
        </div>
        <div className="flex flex-col gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-left ${
                status === s ? "border-[1.5px] border-diose-amber bg-diose-amber/5" : "border border-diose-border"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                  status === s ? "bg-diose-amber" : "border-[1.5px] border-gray-300"
                }`}
              >
                {status === s && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className={`text-[13px] ${status === s ? "font-medium text-diose-amber" : "text-gray-600"}`}>
                {s}
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
        <button className="bg-diose-amber hover:bg-diose-amber-dark text-white p-3.5 text-center cursor-pointer transition-colors">
          <span className="text-[13px] font-semibold tracking-[0.1em] uppercase">Guardar cambios</span>
        </button>
        <button className="border border-diose-border-light p-3 text-center cursor-pointer flex items-center justify-center gap-1.5 hover:bg-red-50">
          <span className="text-xs text-diose-danger tracking-[0.04em]">Eliminar pedido</span>
        </button>
      </div>
    </div>
  );
}
