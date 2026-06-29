"use client";

import { useState } from "react";
import { ProductIcon } from "@/components/icons";
import type { Product } from "@/data/products";

export default function ProductGallery({ product }: { product: Product }) {
  const images = product.images ?? [];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full max-w-[440px] aspect-square bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 overflow-hidden">
        {images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[active]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <>
            <ProductIcon icon={product.icon} size={110} color="rgba(255,255,255,.2)" strokeWidth={0.7} />
            <span className="text-[10px] text-white/20 tracking-[0.16em] uppercase">Imagen del producto</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              className={`w-14 h-14 border overflow-hidden cursor-pointer ${
                i === active ? "border-diose-amber" : "border-white/15"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
