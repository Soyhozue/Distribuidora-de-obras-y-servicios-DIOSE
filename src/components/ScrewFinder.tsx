"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseInches } from "@/lib/measures";

export type ScrewFinderOption = { id: string; name: string; diameterLabel: string; variantLabel: string };

function sortByInches<T extends { label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (parseInches(a.label) ?? 0) - (parseInches(b.label) ?? 0));
}

export default function ScrewFinder({ options }: { options: ScrewFinderOption[] }) {
  const router = useRouter();

  const diameters = useMemo(() => {
    const unique = [...new Set(options.map((o) => o.diameterLabel))];
    return sortByInches(unique.map((label) => ({ label })));
  }, [options]);

  const [diameter, setDiameter] = useState("");

  const lengths = useMemo(() => {
    if (!diameter) return [];
    const unique = [...new Set(options.filter((o) => o.diameterLabel === diameter).map((o) => o.variantLabel))];
    return sortByInches(unique.map((label) => ({ label })));
  }, [options, diameter]);

  const [length, setLength] = useState("");
  const [matches, setMatches] = useState<ScrewFinderOption[] | null>(null);

  function handleDiameterChange(value: string) {
    setDiameter(value);
    setLength("");
    setMatches(null);
  }

  function handleSearch() {
    const found = options.filter((o) => o.diameterLabel === diameter && o.variantLabel === length);
    if (found.length === 1) {
      router.push(`/producto/${found[0].id}`);
      return;
    }
    setMatches(found);
  }

  if (diameters.length === 0) return null;

  return (
    <section className="bg-diose-black px-6 md:px-20 py-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end gap-4">
        <div className="shrink-0">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-diose-amber mb-1">
            Tornillería
          </div>
          <div className="font-heading text-xl md:text-2xl text-white tracking-[0.03em] leading-tight">
            ¿Buscas un tornillo?
            <br className="hidden md:block" /> Encuéntralo por medida
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 md:justify-end">
          <select
            value={diameter}
            onChange={(e) => handleDiameterChange(e.target.value)}
            className="border border-white/20 bg-white/5 text-white px-3.5 py-2.5 text-sm outline-none focus:border-diose-amber cursor-pointer sm:w-40"
          >
            <option value="" className="text-diose-black">
              Grosor
            </option>
            {diameters.map((d) => (
              <option key={d.label} value={d.label} className="text-diose-black">
                {d.label}
              </option>
            ))}
          </select>

          <select
            value={length}
            onChange={(e) => {
              setLength(e.target.value);
              setMatches(null);
            }}
            disabled={!diameter}
            className="border border-white/20 bg-white/5 text-white px-3.5 py-2.5 text-sm outline-none focus:border-diose-amber cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed sm:w-40"
          >
            <option value="" className="text-diose-black">
              Medida (largo)
            </option>
            {lengths.map((l) => (
              <option key={l.label} value={l.label} className="text-diose-black">
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            disabled={!diameter || !length}
            className="bg-diose-amber hover:bg-diose-amber-dark text-white px-6 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Buscar
          </button>
        </div>
      </div>

      {matches && (
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/10">
          {matches.length === 0 ? (
            <p className="text-sm text-white/60">
              No encontramos un tornillo de {diameter} x {length}. Prueba con otra combinación o{" "}
              <a href="/contacto" className="text-diose-amber underline">
                contáctanos
              </a>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-white/60">Encontramos {matches.length} coincidencias:</p>
              <div className="flex flex-wrap gap-2">
                {matches.map((m) => (
                  <a
                    key={m.id}
                    href={`/producto/${m.id}`}
                    className="text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"
                  >
                    {m.name} — {m.diameterLabel} x {m.variantLabel}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
