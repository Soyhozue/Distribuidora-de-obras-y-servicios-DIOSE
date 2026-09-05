"use client";

import { useState } from "react";
import { ProductIcon } from "@/components/icons";
import SizeRuler, { type RulerMark } from "@/components/SizeRuler";
import type { Product } from "@/data/products";

export type GalleryScale = {
  inches: number;
  label: string;
  rulerMax: number;
  marks: RulerMark[];
  diameter?: { inches: number; label: string };
};

export default function ProductGallery({ product, scale }: { product: Product; scale?: GalleryScale }) {
  const images = product.images ?? [];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex gap-3 sm:gap-4 w-full items-start">
        {scale && (
          <SizeRuler
            inches={scale.inches}
            label={scale.label}
            rulerMax={scale.rulerMax}
            marks={scale.marks}
            diameter={scale.diameter}
          />
        )}

        <div className="flex-1 aspect-square bg-gray-50 border border-diose-border-light relative overflow-hidden">
          {images.length > 0 ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={images[active]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain p-4 animate-reveal-down"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ProductIcon icon={product.icon} size={110} color="#d1d5db" strokeWidth={0.7} />
              <span className="text-[10px] text-gray-300 tracking-[0.16em] uppercase mt-3">Imagen del producto</span>
            </div>
          )}
        </div>
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

      {scale && (
        <p className="text-[10px] text-gray-400 text-center leading-relaxed max-w-xs">
          Ajusta la regla a tu pantalla una sola vez y verás la medida a tamaño real en este dispositivo.
        </p>
      )}
    </div>
  );
}
