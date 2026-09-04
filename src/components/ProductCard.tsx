"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductIcon } from "./icons";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toastStore";
import type { Product } from "@/data/products";

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

export function StockBadge({ status }: { status: Product["stockStatus"] }) {
  if (status === "AGOTADO") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-diose-danger shrink-0" />
        <span className="text-[9px] text-diose-danger tracking-[0.08em] uppercase font-medium">Agotado</span>
      </span>
    );
  }
  if (status === "STOCK_BAJO") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-diose-amber shrink-0" />
        <span className="text-[9px] text-diose-amber tracking-[0.08em] uppercase font-medium">Stock bajo</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative flex w-1.5 h-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-diose-success opacity-75" />
        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-diose-success" />
      </span>
      <span className="text-[9px] text-diose-success tracking-[0.08em] uppercase font-medium">En stock</span>
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const agotado = product.stockStatus === "AGOTADO";
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);
  const [added, setAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (agotado) return;
    add(product, Math.max(1, product.minOrderQty ?? 1));
    showToast(`${product.name} agregado al carrito`, "success");
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Link
      href={`/producto/${product.id}`}
      className={`group relative block bg-white border border-diose-border overflow-hidden transition-all duration-300 hover:border-diose-amber hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${
        agotado ? "opacity-60" : ""
      }`}
    >
      {product.images && product.images[0] ? (
        <div className="relative w-full aspect-square bg-white overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CartFab agotado={agotado} added={added} onClick={handleAddToCart} />
        </div>
      ) : (
        <div
          className="relative w-full aspect-square bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: "radial-gradient(#E0E0E0 1px,transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <ProductIcon icon={product.icon} />
          <CartFab agotado={agotado} added={added} onClick={handleAddToCart} />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
            {product.brand}
          </span>
          <StockBadge status={product.stockStatus} />
        </div>
        <div className="text-[13px] font-medium text-diose-black leading-snug mb-2.5 line-clamp-2 group-hover:text-diose-amber transition-colors">
          {product.name}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-base font-semibold text-diose-amber">
            {formatPrice(product.price)}
            <span className="text-[11px] font-normal text-gray-400 ml-1">MXN</span>
          </div>
          {product.unit && (
            <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-gray-400 border border-diose-border-light px-2 py-0.5 shrink-0">
              {product.unit}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function CartFab({
  agotado,
  added,
  onClick,
}: {
  agotado: boolean;
  added: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={agotado}
      aria-label="Agregar al carrito"
      title={agotado ? "Agotado" : "Agregar al carrito"}
      className={`group/cart absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full border flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.22)] cursor-pointer transition-all duration-200 ${
        agotado
          ? "bg-gray-200 border-gray-300 cursor-not-allowed"
          : added
            ? "bg-diose-success border-diose-success scale-110"
            : "bg-white border-diose-black hover:bg-diose-black hover:scale-110"
      }`}
    >
      {added ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={agotado ? "stroke-gray-400" : "stroke-diose-black group-hover/cart:stroke-white"}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
}
