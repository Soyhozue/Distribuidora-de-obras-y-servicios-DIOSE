"use client";

import { useMemo, useState } from "react";
import { formatPrice as formatPriceRaw } from "@/lib/currency";

// Redondea a centavos antes de formatear — las fórmulas de comisión arrastran
// más decimales de los que tiene sentido mostrarle al usuario.
function formatPrice(amount: number): string {
  return formatPriceRaw(Math.round(amount * 100) / 100);
}

// Tarifa observada de Mercado Pago (Checkout) para cobros con tarjeta:
// comisión % + cargo fijo, más IVA sobre esa comisión. Editables porque
// Mercado Pago puede cambiar tus tarifas negociadas.
const DEFAULT_RATE = 3.49;
const DEFAULT_FIXED = 4;
const DEFAULT_IVA = 16;

const SHIPPING_REFERENCE = [
  { label: "Hasta 1 kg", price: 120 },
  { label: "Hasta 3 kg", price: 180 },
  { label: "Hasta 5 kg", price: 250 },
  { label: "Hasta 10 kg", price: 350 },
  { label: "Hasta 20 kg", price: 500 },
  { label: "Más de 20 kg", price: 700 },
];

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full border border-diose-border px-3.5 py-2.5 text-sm outline-none focus:border-diose-black"
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ResultRow({ label, value, strong, negative }: { label: string; value: string; strong?: boolean; negative?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${strong ? "border-t border-diose-black pt-3 mt-1" : ""}`}>
      <span className={`text-sm ${strong ? "font-semibold text-diose-black" : "text-gray-500"}`}>{label}</span>
      <span
        className={`text-sm ${strong ? "font-bold text-lg text-green-600" : "font-medium"} ${
          negative ? "text-red-500" : "text-diose-black"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SimuladorClient() {
  const [metodo, setMetodo] = useState<"tarjeta" | "otro">("tarjeta");

  const [rate, setRate] = useState(DEFAULT_RATE);
  const [fixed, setFixed] = useState(DEFAULT_FIXED);
  const [iva, setIva] = useState(DEFAULT_IVA);

  const [precio, setPrecio] = useState(500);
  const [cantidad, setCantidad] = useState(1);
  const [esJuarez, setEsJuarez] = useState(false);
  const [zonaIdx, setZonaIdx] = useState(0);

  // El envío siempre lo paga el cliente, aparte del precio del producto —
  // nunca es un número libre: sale de la misma regla que usa el checkout real
  // (gratis en Juárez, tarifa por peso fuera de Juárez).
  const envioCobrado = esJuarez ? 0 : SHIPPING_REFERENCE[zonaIdx].price;

  const k = (rate / 100) * (1 + iva / 100); // fracción del total que se va en comisión %
  const fixedAdj = fixed * (1 + iva / 100); // cargo fijo + su IVA

  const result = useMemo(() => {
    const totalCobrado = precio * cantidad + envioCobrado;
    const comision = metodo === "tarjeta" ? totalCobrado * k + fixedAdj : 0;
    const neto = totalCobrado - comision;
    return { totalCobrado, comision, neto };
  }, [precio, cantidad, envioCobrado, metodo, k, fixedAdj]);

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center justify-between px-9 shrink-0">
        <div className="flex items-baseline gap-4">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Simulador de comisión</span>
          <span className="text-xs text-gray-400">Cuánto te queda después de Mercado Pago</span>
        </div>
      </div>

      <div className="p-9 max-w-3xl">
        <div className="grid grid-cols-[1fr_1fr] gap-6">
          {/* Inputs */}
          <div className="bg-white border border-diose-border p-6 flex flex-col gap-5">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">
                Método de pago
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMetodo("tarjeta")}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium cursor-pointer border ${
                    metodo === "tarjeta" ? "bg-diose-black text-white border-diose-black" : "border-diose-border text-gray-500"
                  }`}
                >
                  Tarjeta (Mercado Pago)
                </button>
                <button
                  onClick={() => setMetodo("otro")}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium cursor-pointer border ${
                    metodo === "otro" ? "bg-diose-black text-white border-diose-black" : "border-diose-border text-gray-500"
                  }`}
                >
                  Transferencia / Efectivo
                </button>
              </div>
              {metodo === "otro" && (
                <p className="text-[11px] text-gray-400 mt-1.5">Sin comisión de Mercado Pago — recibes el 100%.</p>
              )}
            </div>

            <NumberField label="Precio de venta por pieza" value={precio} onChange={setPrecio} suffix="MXN" />
            <NumberField label="Cantidad de piezas" value={cantidad} onChange={setCantidad} />

            <div>
              <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">
                Envío — siempre lo paga el cliente, aparte del precio
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setEsJuarez(true)}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium cursor-pointer border ${
                    esJuarez ? "bg-diose-black text-white border-diose-black" : "border-diose-border text-gray-500"
                  }`}
                >
                  Ciudad Juárez (gratis)
                </button>
                <button
                  onClick={() => setEsJuarez(false)}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium cursor-pointer border ${
                    !esJuarez ? "bg-diose-black text-white border-diose-black" : "border-diose-border text-gray-500"
                  }`}
                >
                  Foráneo
                </button>
              </div>

              {!esJuarez && (
                <select
                  value={zonaIdx}
                  onChange={(e) => setZonaIdx(Number(e.target.value))}
                  className="w-full border border-diose-border px-3.5 py-2.5 text-sm outline-none focus:border-diose-black bg-white"
                >
                  {SHIPPING_REFERENCE.map((r, i) => (
                    <option key={r.label} value={i}>
                      {r.label} — {formatPrice(r.price)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {metodo === "tarjeta" && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-400 select-none">Ajustar tarifa de Mercado Pago</summary>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <NumberField label="Comisión %" value={rate} onChange={setRate} />
                  <NumberField label="Cargo fijo" value={fixed} onChange={setFixed} suffix="MXN" />
                  <NumberField label="IVA %" value={iva} onChange={setIva} />
                </div>
              </details>
            )}
          </div>

          {/* Results */}
          <div className="bg-white border border-diose-border p-6">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">Resultado</p>
            <ResultRow label="Total cobrado al cliente" value={formatPrice(result.totalCobrado)} />
            <ResultRow
              label={metodo === "tarjeta" ? "Comisión de Mercado Pago" : "Comisión"}
              value={metodo === "tarjeta" ? `− ${formatPrice(result.comision)}` : formatPrice(0)}
              negative={metodo === "tarjeta"}
            />
            <ResultRow label="Te queda" value={formatPrice(result.neto)} strong />
          </div>
        </div>
      </div>
    </>
  );
}
