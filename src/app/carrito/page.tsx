"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CloseIcon, ProductIcon, WhatsAppIcon } from "@/components/icons";
import { cartTotals, useCartStore } from "@/store/cart";

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const { subtotal, shipping, total, pieceCount } = cartTotals(lines);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={lines.length} />

      <div className="h-16 border-b border-diose-border-light flex items-center px-6 md:px-16 gap-4">
        <h1 className="font-heading text-3xl md:text-4xl text-diose-black tracking-[0.04em]">Mi carrito</h1>
        <span className="text-sm text-gray-400">{lines.length} productos</span>
      </div>

      {lines.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-gray-400 text-sm">Tu carrito está vacío.</p>
          <Link
            href="/catalogo"
            className="bg-diose-black text-white px-8 py-3 text-[13px] font-semibold tracking-[0.08em] uppercase"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-1">
          {/* CART ITEMS */}
          <div className="flex-1 p-6 md:px-16 md:py-8">
            {lines.map((line) => (
              <div
                key={line.product.id}
                className="flex items-center gap-6 py-5 border-b border-gray-100"
              >
                <div
                  className="w-20 h-20 shrink-0 bg-[#F5F5F5] flex items-center justify-center"
                  style={{
                    backgroundImage: "radial-gradient(#E0E0E0 1px,transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                >
                  <ProductIcon icon={line.product.icon} size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">
                    {line.product.brand}
                  </div>
                  <div className="text-[15px] font-medium text-diose-black mb-0.5 truncate">
                    {line.product.name}
                  </div>
                  <div className="text-xs text-gray-300">SKU-{line.product.sku}</div>
                </div>
                <div className="flex items-center border border-diose-border shrink-0">
                  <button
                    onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer border-r border-diose-border text-gray-600 font-light"
                  >
                    −
                  </button>
                  <div className="w-10 h-8 flex items-center justify-center text-[13px] font-medium">
                    {line.quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(line.product.id, line.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer border-l border-diose-border text-gray-600 font-light"
                  >
                    +
                  </button>
                </div>
                <div className="text-right shrink-0 min-w-20">
                  <div className="text-base font-semibold text-diose-amber">
                    {formatPrice(line.product.price * line.quantity)}
                  </div>
                </div>
                <button onClick={() => remove(line.product.id)} className="shrink-0 cursor-pointer">
                  <CloseIcon />
                </button>
              </div>
            ))}

            <Link href="/catalogo" className="inline-block mt-7 text-[13px] text-gray-400 underline">
              Seguir comprando
            </Link>
          </div>

          {/* ORDER SUMMARY */}
          <div className="w-full md:w-[400px] bg-diose-gray border-t md:border-t-0 md:border-l border-diose-border-light p-9 shrink-0">
            <div className="font-heading text-[28px] text-diose-black tracking-[0.06em] mb-8">Resumen</div>
            <div className="flex flex-col gap-3.5 mb-6">
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">Subtotal ({pieceCount} pzas)</span>
                <span className="text-[13px] text-diose-black font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">Envío</span>
                <span className="text-[13px] text-diose-black font-medium">{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-500">¿Tienes un código?</span>
                <div className="flex">
                  <input
                    placeholder="Cupón"
                    className="border border-diose-border border-r-0 px-2.5 py-1.5 text-xs w-30 outline-none bg-white"
                  />
                  <div className="bg-gray-800 text-white px-3 py-1.5 text-xs font-medium cursor-pointer tracking-[0.06em]">
                    Aplicar
                  </div>
                </div>
              </div>
            </div>
            <div className="h-px bg-gray-300 mb-5" />
            <div className="flex justify-between mb-8">
              <span className="text-base font-semibold text-diose-black">Total</span>
              <span className="text-[22px] font-semibold text-diose-black">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="block bg-diose-black hover:bg-diose-amber text-white p-4 text-center cursor-pointer mb-3 transition-colors"
            >
              <span className="text-[13px] font-semibold tracking-[0.1em] uppercase">Proceder al pago</span>
            </Link>
            <a
              href="https://wa.me/526561234567"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 p-3.5 text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <WhatsAppIcon size={14} color="#555" />
              <span className="text-[13px] text-gray-600 tracking-[0.04em]">Cotizar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
