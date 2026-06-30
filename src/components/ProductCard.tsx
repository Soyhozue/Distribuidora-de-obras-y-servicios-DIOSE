import Link from "next/link";
import { ProductIcon } from "./icons";
import type { Product } from "@/data/products";

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

export function StockBadge({ status }: { status: Product["stockStatus"] }) {
  if (status === "AGOTADO") {
    return (
      <span className="text-[9px] border border-diose-danger text-diose-danger px-2 py-0.5 tracking-[0.08em] uppercase">
        Agotado
      </span>
    );
  }
  if (status === "STOCK_BAJO") {
    return (
      <span className="text-[9px] bg-diose-amber/10 border border-diose-amber text-diose-amber px-2 py-0.5 tracking-[0.08em] uppercase">
        Stock bajo
      </span>
    );
  }
  return (
    <span className="text-[9px] bg-diose-amber text-white px-2 py-0.5 tracking-[0.08em] uppercase">
      En stock
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const agotado = product.stockStatus === "AGOTADO";
  return (
    <Link
      href={`/producto/${product.id}`}
      className={`group block bg-white border border-diose-border overflow-hidden transition-all duration-200 hover:border-diose-amber hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${
        agotado ? "opacity-60" : ""
      }`}
    >
      <div
        className="relative w-full aspect-square bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(#E0E0E0 1px,transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {product.images && product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ProductIcon icon={product.icon} />
        )}
      </div>
      <div className="p-3.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
            {product.brand}
          </span>
          <StockBadge status={product.stockStatus} />
        </div>
        <div className="text-[13px] font-medium text-diose-black leading-snug mb-2.5 line-clamp-2">
          {product.name}
        </div>
        <div className="text-base font-semibold text-diose-amber">
          {formatPrice(product.price)}
          {product.unit && <span className="text-[11px] font-normal"> {product.unit}</span>}
        </div>
      </div>
    </Link>
  );
}
