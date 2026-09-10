"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  // Texto local independiente del número calculado — así se puede borrar el
  // "0" y escribir libremente en vez de que el campo se "trabe" en 0 o
  // anteponga dígitos nuevos delante del cero (bug del <input type="number">
  // controlado directamente por el valor numérico).
  const [text, setText] = useState(String(value));
  const lastPushed = useRef(value);

  useEffect(() => {
    // Solo resincroniza si el valor cambió por otra vía (no por este campo) —
    // por ejemplo, si en el futuro algo más resetea el formulario.
    if (value !== lastPushed.current) {
      setText(String(value));
      lastPushed.current = value;
    }
  }, [value]);

  return (
    <div>
      <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            if (!/^\d*\.?\d*$/.test(raw)) return;
            setText(raw);
            const num = raw === "" || raw === "." ? 0 : Number(raw);
            lastPushed.current = num;
            onChange(num);
          }}
          onBlur={() => {
            if (text === "" || text === ".") setText("0");
          }}
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
  const [envioManual, setEnvioManual] = useState(0);

  // El envío siempre lo paga el cliente, aparte del precio del producto —
  // gratis en Juárez (igual que en el checkout real). Fuera de Juárez lo
  // metes tú a mano por ahora, mientras no tengas definido el peso/costo de
  // envío de cada producto.
  const envioCobrado = esJuarez ? 0 : envioManual;

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
                <>
                  <NumberField label="Envío que le cobras al cliente" value={envioManual} onChange={setEnvioManual} suffix="MXN" />
                  <details className="text-[11px] text-gray-400 mt-2">
                    <summary className="cursor-pointer select-none">Ver tarifas de referencia por peso</summary>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      {SHIPPING_REFERENCE.map((r) => (
                        <div key={r.label} className="flex justify-between">
                          <span>{r.label}</span>
                          <span className="font-medium text-diose-black">{formatPrice(r.price)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </>
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
