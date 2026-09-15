"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";
import { calcShipping, isLocalJuarez } from "@/lib/shipping";

export type CartLine = {
  product: Product;
  quantity: number;
};

export type CartCoupon = { code: string; discount: number };

type CartState = {
  lines: CartLine[];
  coupon: CartCoupon | null;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setCoupon: (coupon: CartCoupon) => void;
  clearCoupon: () => void;
  revalidateCoupon: () => Promise<void>;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      add: (product, quantity = 1) => {
        const existing = get().lines.find((l) => l.product.id === product.id);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l
            ),
          });
        } else {
          set({ lines: [...get().lines, { product, quantity }] });
        }
      },
      remove: (productId) => set({ lines: get().lines.filter((l) => l.product.id !== productId) }),
      setQuantity: (productId, quantity) =>
        set({
          lines: get().lines.map((l) =>
            l.product.id === productId
              ? { ...l, quantity: Math.max(l.product.minOrderQty ?? 1, quantity) }
              : l
          ),
        }),
      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
      revalidateCoupon: async () => {
        const current = get().coupon;
        if (!current) return;
        try {
          const res = await fetch(`/api/coupons?code=${encodeURIComponent(current.code)}`);
          if (!res.ok) {
            set({ coupon: null });
            return;
          }
          const data = await res.json();
          set({ coupon: { code: data.code, discount: data.discount } });
        } catch {
          // Network hiccup — keep the coupon as-is; the order creation
          // re-validates it server-side either way.
        }
      },
      clear: () => set({ lines: [], coupon: null }),
    }),
    { name: "diose-cart" }
  )
);

export function cartTotals(lines: CartLine[], city = "Ciudad Juárez") {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const totalWeight = lines.reduce((sum, l) => sum + ((l.product as { weight?: number }).weight ?? 0) * l.quantity, 0);
  const isJuarez = isLocalJuarez(city);
  let shipping = 0;
  if (lines.length > 0 && !isJuarez && totalWeight > 0) {
    shipping = calcShipping(totalWeight, city);
  }
  const total = subtotal + shipping;
  const pieceCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  // Para productos que se venden por bolsa/paquete (minOrderQty > 1), un
  // "artículo" es una bolsa completa, no cada pieza suelta dentro de ella —
  // si agregaste 1 bolsa de 35, esto cuenta 1, no 35.
  const itemCount = lines.reduce((sum, l) => {
    const packSize = l.product.minOrderQty ?? 1;
    return sum + (packSize > 1 ? Math.round(l.quantity / packSize) : l.quantity);
  }, 0);
  return { subtotal, shipping, total, pieceCount, itemCount, totalWeight, isJuarez };
}
