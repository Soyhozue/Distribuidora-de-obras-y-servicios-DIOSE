"use client";

import { useState } from "react";
import { ProductIcon } from "@/components/icons";
import type { Product } from "@/data/products";

export default function ProductGallery({ product }: { product: Product }) {
  const images = product.images ?? [];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full aspect-square bg-gray-50 border border-diose-border-light flex flex-col items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[active]} alt={product.name} className="w-full h-full object-contain p-4" />
        ) : (
          <>
            <ProductIcon icon={product.icon} size={110} color="#d1d5db" strokeWidth={0.7} />
            <span className="text-[10px] text-gray-300 tracking-[0.16em] uppercase mt-3">Imagen del producto</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              className={`w-16 h-16 border overflow-hidden cursor-pointer bg-gray-50 ${
                i === active ? "border-diose-amber" : "border-diose-border-light"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
