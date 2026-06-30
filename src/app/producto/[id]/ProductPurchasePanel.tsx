"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toastStore";
import { WhatsAppIcon } from "@/components/icons";
import type { Product } from "@/data/products";

export default function ProductPurchasePanel({ product, whatsapp }: { product: Product; whatsapp: string }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);
  const agotado = product.stockStatus === "AGOTADO";

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center border border-diose-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-11 flex items-center justify-center cursor-pointer border-r border-diose-border text-lg text-gray-700 font-light"
          >
            −
          </button>
          <div className="w-13 h-11 flex items-center justify-center text-[15px] font-medium text-diose-black">
            {quantity}
          </div>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-11 flex items-center justify-center cursor-pointer border-l border-diose-border text-lg text-gray-700 font-light"
          >
            +
          </button>
        </div>
        <button
          disabled={agotado}
          onClick={() => {
            add(product, quantity);
            setAdded(true);
            showToast(`"${product.name}" agregado al carrito`);
            setTimeout(() => setAdded(false), 1800);
          }}
          className="flex-1 bg-diose-amber hover:bg-diose-amber-dark text-white h-11 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-[13px] font-semibold tracking-[0.1em] uppercase">
            {added ? "Agregado ✓" : "Agregar al carrito"}
          </span>
        </button>
      </div>
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-diose-border-light h-11 flex items-center justify-center gap-2 cursor-pointer"
      >
        <WhatsAppIcon size={16} color="#555" />
        <span className="text-[13px] text-gray-600 tracking-[0.04em]">Cotizar por WhatsApp</span>
      </a>
    </>
  );
}
