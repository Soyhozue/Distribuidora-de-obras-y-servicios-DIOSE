"use client";

import { useState } from "react";

export default function ComprobanteUploader({ orderId }: { orderId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function upload() {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/orders/${orderId}/comprobante`, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir el comprobante.");
        return;
      }
      setDone(true);
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 bg-green-50 border border-green-200 px-3.5 py-3 text-xs text-green-700 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Comprobante recibido — en cuanto lo verifiquemos, confirmamos tu pedido.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">
        ¿Ya transferiste? Sube tu comprobante
      </label>
      <div className="flex gap-2">
        <label className="flex-1 border border-diose-border px-3.5 py-2.5 text-xs text-gray-500 cursor-pointer hover:border-diose-black truncate">
          {file ? file.name : "Elegir imagen..."}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          onClick={upload}
          disabled={!file || uploading}
          className="bg-diose-black text-white px-5 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase cursor-pointer disabled:opacity-40 shrink-0"
        >
          {uploading ? "Subiendo..." : "Subir"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <p className="text-[11px] text-gray-400 mt-2">
        Si prefieres, también puedes enviárnoslo por WhatsApp mencionando tu número de pedido.
      </p>
    </div>
  );
}
