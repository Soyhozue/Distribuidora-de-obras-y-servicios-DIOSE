"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

type Coupon = { id: string; code: string; discount: number; active: boolean; createdAt: Date };

export default function CuponesManager({ cupones }: { cupones: Coupon[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function create() {
    const pct = parseFloat(discount);
    if (!code.trim() || isNaN(pct) || pct <= 0 || pct > 100) {
      setError("Código requerido y descuento entre 1 y 100.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), discount: pct / 100 }),
      });
      setCode("");
      setDiscount("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9 shrink-0">
        <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Cupones</span>
      </div>

      <div className="p-9 flex flex-col gap-6">
        {/* Crear cupón */}
        <div className="bg-white border border-diose-border p-6">
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-4">
            Nuevo cupón
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-[0.1em]">Código</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VERANO20"
                className="border border-diose-border px-3 py-2 text-sm font-mono w-36 outline-none focus:border-diose-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-[0.1em]">Descuento %</label>
              <input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
                type="number"
                min="1"
                max="100"
                className="border border-diose-border px-3 py-2 text-sm w-24 outline-none focus:border-diose-black"
              />
            </div>
            <button
              onClick={create}
              disabled={saving}
              className="bg-diose-black text-white px-6 py-2 text-xs font-semibold tracking-[0.08em] uppercase cursor-pointer disabled:opacity-50"
            >
              {saving ? "Guardando..." : "+ Crear cupón"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        {/* Lista */}
        <div className="bg-white border border-diose-border overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px_120px] px-6 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black">
            {["Código", "Descuento", "Estado", ""].map((h) => (
              <span key={h} className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">{h}</span>
            ))}
          </div>
          {cupones.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-gray-400">No hay cupones todavía.</div>
          )}
          {cupones.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_100px_80px_120px] px-6 py-3.5 border-b border-gray-100 items-center">
              <span className="font-mono text-sm font-semibold text-diose-black">{c.code}</span>
              <span className="text-sm text-gray-700">{Math.round(c.discount * 100)}%</span>
              <button
                onClick={() => toggle(c.id, c.active)}
                className={`text-[10px] px-2.5 py-1 font-semibold tracking-[0.08em] uppercase w-fit cursor-pointer ${
                  c.active
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {c.active ? "Activo" : "Inactivo"}
              </button>
              <button
                onClick={() => setConfirmId(c.id)}
                className="text-xs text-gray-400 hover:text-red-500 cursor-pointer text-left"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
      {confirmId && (
        <ConfirmModal
          message="¿Eliminar este cupón?"
          onConfirm={() => { const id = confirmId; setConfirmId(null); remove(id); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}
