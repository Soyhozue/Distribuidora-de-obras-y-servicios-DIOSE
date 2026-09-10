"use client";

import { useCartStore, cartTotals } from "@/store/cart";

export default function CartBadge() {
  const lines = useCartStore((s) => s.lines);
  const { itemCount } = cartTotals(lines);

  if (itemCount <= 0) return null;

  return (
    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-diose-amber rounded-full flex items-center justify-center">
      <span className="text-[9px] font-semibold text-white">{itemCount > 99 ? "99+" : itemCount}</span>
    </div>
  );
}
