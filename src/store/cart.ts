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

export function cartTotals(lines: CartLine[], city = "Ciudad Juárez") {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const totalWeight = lines.reduce((sum, l) => sum + ((l.product as { weight?: number }).weight ?? 0) * l.quantity, 0);
  // Import-free inline calc to avoid circular deps
  const isJuarez = ["juárez","juarez","cd. juárez","ciudad juárez","ciudad juarez"].some((k) => city.toLowerCase().includes(k));
  let shipping = 0;
  if (lines.length > 0 && !isJuarez) {
    const rates = [{ max: 1, p: 120 },{ max: 3, p: 180 },{ max: 5, p: 250 },{ max: 10, p: 350 },{ max: 20, p: 500 },{ max: Infinity, p: 700 }];
    shipping = (rates.find((r) => totalWeight <= r.max) ?? rates[rates.length - 1]).p;
    if (totalWeight === 0) shipping = 0; // sin peso registrado, no cobrar hasta confirmar
  }
  const total = subtotal + shipping;
  const pieceCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { subtotal, shipping, total, pieceCount, totalWeight, isJuarez };
}
