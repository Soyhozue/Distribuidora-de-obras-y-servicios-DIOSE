"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

type Result = { type: "pedido" | "producto"; label: string; sub: string; href: string };

export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={ref} className="relative">
      <div className="border border-diose-border px-3.5 py-1.5 flex items-center gap-2 bg-[#FAFAFA] w-52">
        <SearchIcon size={13} color="#999" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pedidos, productos..."
          className="text-xs text-gray-600 bg-transparent outline-none w-full placeholder:text-gray-400"
        />
        {loading && <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin shrink-0" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-diose-border shadow-lg z-50 w-80">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => go(r.href)}
              className="w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-[#FAFAFA] cursor-pointer text-left"
            >
              <span className={`text-[9px] px-1.5 py-0.5 font-semibold tracking-[0.1em] uppercase mt-0.5 shrink-0 ${
                r.type === "pedido" ? "bg-diose-amber/10 text-diose-amber" : "bg-gray-100 text-gray-500"
              }`}>
                {r.type === "pedido" ? "Pedido" : "Producto"}
              </span>
              <div>
                <div className="text-[13px] font-medium text-diose-black">{r.label}</div>
                <div className="text-[11px] text-gray-400">{r.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && query.trim() && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-diose-border shadow-lg z-50 w-64 px-4 py-3">
          <span className="text-xs text-gray-400">Sin resultados para &quot;{query}&quot;</span>
        </div>
      )}
    </div>
  );
}
