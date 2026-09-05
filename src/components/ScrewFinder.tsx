"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseInches, formatMm } from "@/lib/measures";
import { useScreenCalibration } from "@/lib/screenCalibration";
import CalibrationPanel from "./CalibrationPanel";

export type ScrewFinderOption = { id: string; name: string; diameterLabel: string; variantLabel: string };

function sortByInches<T extends { label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (parseInches(a.label) ?? 0) - (parseInches(b.label) ?? 0));
}

export default function ScrewFinder({ options }: { options: ScrewFinderOption[] }) {
  const [mode, setMode] = useState<"visual" | "list">("visual");

  const diameters = useMemo(() => {
    const unique = [...new Set(options.map((o) => o.diameterLabel))];
    return sortByInches(unique.map((label) => ({ label })));
  }, [options]);

  if (diameters.length === 0) return null;

  return (
    <section className="bg-diose-black px-6 md:px-20 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-diose-amber mb-1">
              Tornillería
            </div>
            <div className="font-heading text-xl md:text-2xl text-white tracking-[0.03em] leading-tight">
              ¿Buscas un tornillo? Encuéntralo aquí
            </div>
          </div>
          <div className="flex border border-white/20">
            <button
              onClick={() => setMode("visual")}
              className={`px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase cursor-pointer transition-colors ${
                mode === "visual" ? "bg-diose-amber text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Comparar en pantalla
            </button>
            <button
              onClick={() => setMode("list")}
              className={`px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase cursor-pointer transition-colors ${
                mode === "list" ? "bg-diose-amber text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Ya sé la medida
            </button>
          </div>
        </div>

        {mode === "visual" ? <VisualFinder options={options} /> : <ListFinder options={options} />}
      </div>
    </section>
  );
}

function ListFinder({ options }: { options: ScrewFinderOption[] }) {
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2.5">
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

      {matches && (
        <div className="mt-4 pt-4 border-t border-white/10">
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
    </div>
  );
}

const MAX_LENGTH_PX = 220;
const MAX_DIAMETER_PX = 90;

function VisualFinder({ options }: { options: ScrewFinderOption[] }) {
  const router = useRouter();
  const cal = useScreenCalibration();

  const diameters = useMemo(() => {
    const unique = [...new Set(options.map((o) => o.diameterLabel))];
    return sortByInches(unique.map((label) => ({ label, inches: parseInches(label) ?? 0 })));
  }, [options]);

  const lengths = useMemo(() => {
    const unique = [...new Set(options.map((o) => o.variantLabel))];
    return sortByInches(unique.map((label) => ({ label, inches: parseInches(label) ?? 0 })));
  }, [options]);

  const [diameterIndex, setDiameterIndex] = useState(0);
  const [lengthIndex, setLengthIndex] = useState(Math.floor(lengths.length / 2));

  const currentDiameter = diameters[diameterIndex] ?? diameters[0];
  const currentLength = lengths[lengthIndex] ?? lengths[0];

  const boltPxRaw = currentLength.inches * cal.ppi;
  const boltPx = Math.min(boltPxRaw, MAX_LENGTH_PX);
  const circlePxRaw = currentDiameter.inches * cal.ppi;
  const circlePx = Math.min(circlePxRaw, MAX_DIAMETER_PX);
  const isCapped = boltPxRaw > MAX_LENGTH_PX || circlePxRaw > MAX_DIAMETER_PX;

  const match = options.find(
    (o) => o.diameterLabel === currentDiameter.label && o.variantLabel === currentLength.label
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
      <div className="flex gap-6 md:gap-10">
        {/* GROSOR */}
        <div className="flex flex-col items-center gap-2 w-28 shrink-0">
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/50">Grosor</span>
          <div className="flex items-center justify-center" style={{ height: MAX_LENGTH_PX + 12 }}>
            <div
              className="rounded-full border-2 border-diose-amber bg-gradient-to-br from-white/20 to-white/5 animate-scale-in"
              style={{ width: circlePx, height: circlePx }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={diameters.length - 1}
            step={1}
            value={diameterIndex}
            onChange={(e) => setDiameterIndex(Number(e.target.value))}
            className="w-full accent-diose-amber cursor-pointer"
          />
          <span className="text-sm font-semibold text-white">{currentDiameter.label}</span>
        </div>

        {/* LARGO */}
        <div className="flex flex-col items-center gap-2 w-28 shrink-0">
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/50">Largo</span>
          <div className="relative w-full flex justify-center" style={{ height: MAX_LENGTH_PX + 12 }}>
            <div className="absolute bg-diose-amber" style={{ top: 0, width: 16, height: 5 }} />
            <div
              className="absolute animate-scale-in"
              style={{
                top: 5,
                width: 10,
                height: boltPx,
                background: "repeating-linear-gradient(180deg, #fff 0 3px, rgba(255,255,255,0.5) 3px 5px)",
              }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={lengths.length - 1}
            step={1}
            value={lengthIndex}
            onChange={(e) => setLengthIndex(Number(e.target.value))}
            className="w-full accent-diose-amber cursor-pointer"
          />
          <span className="text-sm font-semibold text-white">{currentLength.label}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        <p className="text-sm text-white/70 leading-relaxed">
          Mueve los controles hasta que el círculo y la barra midan lo mismo que tu tornillo apoyado en la
          pantalla.{" "}
          <button onClick={cal.openPanel} className="text-diose-amber underline cursor-pointer">
            {cal.calibrated ? "Reajustar mi pantalla" : "Ajustar mi pantalla a tamaño real"}
          </button>
          {isCapped && (
            <span className="text-white/40"> (dibujo a escala reducida para que quepa en pantalla)</span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-white text-base">
            Grosor <strong>{currentDiameter.label}</strong> · Largo <strong>{currentLength.label}</strong>
            <span className="text-white/40 text-sm"> ({formatMm(currentDiameter.inches)} · {formatMm(currentLength.inches)})</span>
          </span>
        </div>

        <div>
          {match ? (
            <button
              onClick={() => router.push(`/producto/${match.id}`)}
              className="bg-diose-amber hover:bg-diose-amber-dark text-white px-6 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase cursor-pointer transition-colors"
            >
              Ver este tornillo
            </button>
          ) : (
            <span className="text-sm text-white/50">No tenemos esa combinación exacta en catálogo.</span>
          )}
        </div>
      </div>

      {cal.panelOpen && (
        <CalibrationPanel
          draftPpi={cal.draftPpi}
          setDraftPpi={cal.setDraftPpi}
          inches={currentLength.inches}
          label={currentLength.label}
          onSave={cal.saveCalibration}
          onReset={cal.resetCalibration}
          onClose={cal.closePanel}
        />
      )}
    </div>
  );
}
