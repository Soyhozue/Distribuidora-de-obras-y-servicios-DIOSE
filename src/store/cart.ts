"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
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
            l.product.id === productId ? { ...l, quantity: Math.max(1, quantity) } : l
          ),
        }),
      clear: () => set({ lines: [] }),
    }),
    { name: "diose-cart" }
  )
);

export function cartTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const shipping = lines.length > 0 ? 280 : 0;
  const total = subtotal + shipping;
  const pieceCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { subtotal, shipping, total, pieceCount };
}
