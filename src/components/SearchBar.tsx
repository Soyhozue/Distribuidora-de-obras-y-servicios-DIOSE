"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setQuery("");
    router.push(`/catalogo?q=${encodeURIComponent(q)}`);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="cursor-pointer" aria-label="Buscar">
        <SearchIcon />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl mx-4 flex items-center border-b-2 border-diose-black"
          >
            <SearchIcon className="ml-4 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Buscar productos..."
              className="flex-1 px-4 py-4 text-sm text-diose-black outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="bg-diose-black text-white px-6 py-4 text-xs font-semibold tracking-[0.08em] uppercase shrink-0"
            >
              Buscar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
