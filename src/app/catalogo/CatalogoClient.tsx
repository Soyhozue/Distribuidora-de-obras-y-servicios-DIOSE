"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ProductCard from "@/components/ProductCard";
import { SearchIcon, ChevronDownIcon } from "@/components/icons";
import type { Product } from "@/data/products";

type CategoryCount = { name: string; count: number };
type BrandCount = { name: string; count: number };

const SORT_OPTIONS = [
  { key: "relevancia", label: "Relevancia" },
  { key: "precio-asc", label: "Precio: menor a mayor" },
  { key: "precio-desc", label: "Precio: mayor a menor" },
  { key: "nombre", label: "Nombre (A-Z)" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const PAGE_SIZE = 12;

const CATEGORY_NAV_LABELS: Record<string, string> = {
  Herramientas: "Herramientas",
  Materiales: "Materiales",
};

export default function CatalogoClient({
  products,
  categories,
  brands,
  initialCategory,
}: {
  products: Product[];
  categories: CategoryCount[];
  brands: BrandCount[];
  initialCategory?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(initialCategory ?? null);
  const [brand, setBrand] = useState<string | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (onlyInStock && p.stockStatus === "AGOTADO") return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    if (sort === "precio-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "precio-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "nombre") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, query, category, brand, onlyInStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, category, brand, onlyInStock, sort]);

  return (
    <div className="flex flex-col min-h-screen bg-diose-gray">
      <Navbar active={(category && CATEGORY_NAV_LABELS[category]) || "Catálogo"} />

      {/* SEARCH + BREADCRUMB BAR */}
      <div className="bg-white border-b border-diose-border-light flex flex-wrap items-center gap-6 px-6 md:px-12 py-3">
        <span className="text-xs text-gray-400">Inicio</span>
        <span className="text-xs text-gray-300">/</span>
        <span className="text-xs text-diose-black font-medium">Catálogo</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2 border border-diose-border bg-[#FAFAFA] px-3.5 py-2 w-full sm:w-64">
          <SearchIcon size={14} color="#999" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en catálogo..."
            className="text-[13px] text-diose-black bg-transparent outline-none w-full placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 relative">
          <span className="text-xs text-gray-400">Ordenar por</span>
          <div
            onClick={() => setSortOpen((v) => !v)}
            className="border border-diose-border px-3.5 py-1.5 text-xs text-gray-700 flex items-center gap-2 cursor-pointer"
          >
            <span>{SORT_OPTIONS.find((o) => o.key === sort)?.label}</span>
            <ChevronDownIcon />
          </div>
          {sortOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-diose-border shadow-lg z-10 min-w-[200px]">
              {SORT_OPTIONS.map((o) => (
                <div
                  key={o.key}
                  onClick={() => {
                    setSort(o.key);
                    setSortOpen(false);
                  }}
                  className="px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  {o.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-64 bg-white border-r border-diose-border-light px-6 py-7 shrink-0">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-3.5">
            Categorías
          </div>
          <div className="flex flex-col">
            <button
              onClick={() => setCategory(null)}
              className="flex items-center gap-2.5 py-2 border-b border-gray-100 cursor-pointer text-left"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                  category === null ? "bg-diose-black border-diose-black" : "border-gray-300"
                }`}
              />
              <span className={`text-[13px] ${category === null ? "text-diose-black font-medium" : "text-gray-600"}`}>
                Todas
              </span>
              <span className="text-[11px] text-gray-300 ml-auto">{products.length}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className="flex items-center gap-2.5 py-2 border-b border-gray-100 cursor-pointer text-left last:border-b-0"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-[1.5px] shrink-0 ${
                    category === cat.name ? "bg-diose-black border-diose-black" : "border-gray-300"
                  }`}
                />
                <span className={`text-[13px] ${category === cat.name ? "text-diose-black font-medium" : "text-gray-600"}`}>
                  {cat.name}
                </span>
                <span className="text-[11px] text-gray-300 ml-auto">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-diose-border-light my-5" />
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-3.5">
            Marcas
          </div>
          <div className="flex flex-col">
            {brands.map((b) => (
              <button
                key={b.name}
                onClick={() => setBrand(brand === b.name ? null : b.name)}
                className="flex items-center gap-2.5 py-1.5 cursor-pointer text-left"
              >
                <div
                  className={`w-3.5 h-3.5 border-[1.5px] shrink-0 flex items-center justify-center ${
                    brand === b.name ? "bg-diose-black border-diose-black" : "border-gray-300"
                  }`}
                >
                  {brand === b.name && (
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
                <span className={`text-[13px] ${brand === b.name ? "text-diose-black font-medium" : "text-gray-600"}`}>
                  {b.name}
                </span>
                <span className="text-[11px] text-gray-300 ml-auto">{b.count}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-diose-border-light my-5" />
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-3.5">
            Disponibilidad
          </div>
          <button
            onClick={() => setOnlyInStock((v) => !v)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div
              className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${
                onlyInStock ? "bg-diose-black" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                  onlyInStock ? "right-0.5" : "left-0.5"
                }`}
              />
            </div>
            <span className="text-[13px] text-diose-black font-medium">Solo en stock</span>
          </button>
        </aside>

        {/* PRODUCT GRID */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {pageProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-20">
              No se encontraron productos con esos filtros.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center cursor-pointer ${
                    page === n ? "bg-diose-black" : "border border-diose-border"
                  }`}
                >
                  <span className={`text-[13px] font-medium ${page === n ? "text-white" : "text-gray-600"}`}>{n}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
