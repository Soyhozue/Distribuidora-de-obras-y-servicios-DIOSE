"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { cartTotals, useCartStore } from "@/store/cart";

function formatPrice(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

const PAYMENT_METHODS = [
  { id: "mercadopago", label: "Tarjeta de crédito / débito (MercadoPago)" },
  { id: "transferencia", label: "Transferencia bancaria" },
  { id: "efectivo", label: "Pago en efectivo (en sucursal)" },
  { id: "whatsapp", label: "Cotización por WhatsApp" },
];

const PAYMENT_MAP: Record<string, string> = {
  mercadopago: "TARJETA",
  transferencia: "TRANSFERENCIA",
  efectivo: "EFECTIVO",
  whatsapp: "WHATSAPP",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Ciudad Juárez");
  const [state, setState] = useState("Chihuahua");
  const [zip, setZip] = useState("");
  const [payment, setPayment] = useState("transferencia");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { subtotal, shipping, total, totalWeight, isJuarez } = cartTotals(lines, city);

  async function confirmOrder() {
    if (!name || !email || !address) {
      setError("Completa al menos nombre, correo y dirección.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (lines.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (payment === "mercadopago") {
        const res = await fetch("/api/checkout/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: `${name} ${lastName}`.trim(),
            customerEmail: email,
            items: lines.map((l) => ({ name: l.product.name, price: l.product.price, quantity: l.quantity })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al iniciar el pago");
        if (data.url) { window.location.href = data.url; return; }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${name} ${lastName}`.trim(),
          customerEmail: email,
          customerPhone: phone,
          address,
          city,
          state,
          zip,
          paymentMethod: PAYMENT_MAP[payment] ?? "TRANSFERENCIA",
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity, unitPrice: l.product.price })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo crear el pedido");
      }
      const data = await res.json();
      clear();
      router.push(`/pedido-confirmado?n=${data.number ?? ""}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hubo un problema. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="h-16 bg-white border-b border-diose-border-light flex items-center justify-between px-6 md:px-12">
        <Link href="/"><Logo invert /></Link>
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-2 px-5 py-2 border-b-2 border-gray-300">
            <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-gray-300 flex items-center justify-center">
              <span className="text-[11px] text-gray-300 font-semibold">1</span>
            </div>
            <span className="text-xs text-gray-400 tracking-[0.06em]">Carrito</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-2 border-b-2 border-diose-amber">
            <div className="w-[22px] h-[22px] rounded-full bg-diose-amber flex items-center justify-center">
              <span className="text-[11px] text-white font-semibold">2</span>
            </div>
            <span className="text-xs text-diose-amber font-semibold tracking-[0.06em]">Datos</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-2 border-b-2 border-diose-border-light">
            <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-diose-border-light flex items-center justify-center">
              <span className="text-[11px] text-gray-300 font-semibold">3</span>
            </div>
            <span className="text-xs text-gray-300 tracking-[0.06em]">Confirmar</span>
          </div>
        </div>
        <div className="w-30" />
      </nav>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="flex-1 p-6 md:px-16 md:py-10">
          <div className="font-heading text-[28px] text-diose-black tracking-[0.04em] mb-7">Datos de envío</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Nombre" value={name} onChange={setName} />
            <Field label="Apellido" value={lastName} onChange={setLastName} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Correo electrónico" type="email" value={email} onChange={setEmail} />
            <Field label="Teléfono" value={phone} onChange={setPhone} />
          </div>
          <div className="mb-4">
            <Field label="Dirección" value={address} onChange={setAddress} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            <Field label="Ciudad" value={city} onChange={setCity} />
            <Field label="Estado" value={state} onChange={setState} />
            <Field label="CP" value={zip} onChange={setZip} />
          </div>

          <div className="font-heading text-2xl text-diose-black tracking-[0.04em] mb-4">Método de pago</div>
          <div className="flex flex-col gap-2.5">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setPayment(m.id)}
                className={`flex items-center gap-3.5 px-4.5 py-3.5 cursor-pointer text-left ${
                  payment === m.id ? "border-[1.5px] border-diose-black" : "border border-diose-border"
                }`}
              >
                <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                  payment === m.id ? "bg-diose-black" : "border-[1.5px] border-gray-300"
                }`}>
                  {payment === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={`text-[13px] ${payment === m.id ? "font-medium text-diose-black" : "text-gray-600"}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-[400px] bg-diose-gray border-t md:border-t-0 md:border-l border-diose-border-light p-9 shrink-0">
          <div className="font-heading text-2xl text-diose-black tracking-[0.04em] mb-6">Tu pedido</div>
          <div className="flex flex-col gap-3.5 mb-5">
            {lines.map((l) => (
              <div key={l.product.id} className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{l.product.name} ×{l.quantity}</span>
                <span className="text-[13px] text-diose-black font-medium">{formatPrice(l.product.price * l.quantity)}</span>
              </div>
            ))}
            {lines.length === 0 && <span className="text-xs text-gray-400">No hay productos en el carrito.</span>}
          </div>
          <div className="h-px bg-gray-300 mb-4" />
          <div className="flex justify-between mb-2.5">
            <span className="text-[13px] text-gray-500">Subtotal</span>
            <span className="text-[13px] text-diose-black">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between items-start mb-5 gap-2">
            <div>
              <span className="text-[13px] text-gray-500">Envío estimado</span>
              {isJuarez && <div className="text-[10px] text-green-600 font-medium tracking-[0.04em] mt-0.5">Envío local · Ciudad Juárez</div>}
              {!isJuarez && totalWeight === 0 && <div className="text-[10px] text-gray-400 mt-0.5">Sin peso registrado — a confirmar</div>}
              {!isJuarez && totalWeight > 0 && <div className="text-[10px] text-gray-400 mt-0.5">{totalWeight.toFixed(2)} kg · envío nacional</div>}
            </div>
            <span className={`text-[13px] font-medium shrink-0 ${isJuarez ? "text-green-600" : "text-diose-black"}`}>
              {isJuarez ? "Gratis" : shipping > 0 ? formatPrice(shipping) : "Por cotizar"}
            </span>
          </div>
          <div className="h-px bg-gray-300 mb-5" />
          <div className="flex justify-between mb-9">
            <span className="text-base font-semibold text-diose-black">Total</span>
            <span className="text-[22px] font-semibold text-diose-black">{formatPrice(total)}</span>
          </div>
          {error && <p className="text-xs text-diose-danger mb-3">{error}</p>}
          <button
            disabled={lines.length === 0 || submitting}
            onClick={confirmOrder}
            className="w-full bg-diose-black hover:bg-diose-amber text-white p-4 text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-[13px] font-semibold tracking-[0.1em] uppercase">
              {submitting ? "Procesando..." : "Confirmar pedido"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-diose-border px-3.5 py-2.5 text-[13px] text-diose-black outline-none focus:border-diose-black"
      />
    </div>
  );
}
