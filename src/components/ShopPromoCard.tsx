"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toastStore";
import { StockBadge } from "./ProductCard";
import type { Product } from "@/data/products";

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

export default function ShopPromoCard({
  imageUrl,
  mediaType,
  badgeText,
  product,
}: {
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  badgeText: string | null;
  product: Product;
}) {
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);
  const agotado = product.stockStatus === "AGOTADO";

  function handleAdd() {
    add(product, 1);
    showToast(`${product.name} agregado al carrito`, "success");
  }

  return (
    <div className="sm:col-span-2 relative bg-diose-black overflow-hidden group flex flex-col sm:flex-row">
      <Link href={`/producto/${product.id}`} className="relative w-full sm:w-1/2 aspect-[4/3] sm:aspect-auto shrink-0 block overflow-hidden">
        {mediaType === "VIDEO" ? (
          <video
            src={imageUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {badgeText && (
          <div className="absolute top-3 right-3 bg-diose-amber text-white text-[11px] font-bold tracking-[0.02em] px-3 py-1.5 rotate-3 shadow-strong">
            {badgeText}
          </div>
        )}
      </Link>

      <div className="w-full sm:w-1/2 bg-white p-5 flex flex-col justify-center gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">{product.brand}</span>
          <StockBadge status={product.stockStatus} />
        </div>
        <Link href={`/producto/${product.id}`} className="font-heading text-xl text-diose-black tracking-[0.02em] leading-tight hover:text-diose-amber transition-colors">
          {product.name}
        </Link>
        <div className="text-2xl font-semibold text-diose-amber">
          {formatPrice(product.price)}
          <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
        </div>
        <button
          onClick={handleAdd}
          disabled={agotado}
          className="bg-diose-black hover:bg-diose-amber text-white px-5 py-3 text-xs font-semibold tracking-[0.08em] uppercase cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {agotado ? "Agotado" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
}
