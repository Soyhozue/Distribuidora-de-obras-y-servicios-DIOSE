"use client";

import { useEffect, useRef, useState } from "react";
import { formatMm } from "@/lib/measures";

export type RulerMark = { label: string; inches: number };

/** Píxeles CSS por pulgada de referencia (aproximación estándar del navegador). */
const DEFAULT_PPI = 96;
const MIN_PPI = 40;
const MAX_PPI = 400;
/** Alto máximo que puede ocupar la cinta antes de reducir la escala. */
const MAX_TAPE_PX = 560;
/** Tarjeta bancaria / INE — medida estándar ISO, igual en todo el mundo. */
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;
const MM_PER_INCH = 25.4;

const STORAGE_KEY = "diose-ruler-ppi";

function readStoredPpi(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < MIN_PPI || value > MAX_PPI) return null;
    return value;
  } catch {
    return null;
  }
}

function fractionLabel(eighths: number): string {
  const whole = Math.floor(eighths / 8);
  const rest = eighths % 8;
  const fraction = rest === 0 ? "" : rest === 4 ? "½" : rest === 2 ? "¼" : rest === 6 ? "¾" : "";
  if (!fraction) return String(whole);
  return whole === 0 ? fraction : `${whole}${fraction}`;
}

export default function SizeRuler({
  inches,
  label,
  rulerMax,
  marks = [],
  diameter,
}: {
  inches: number;
  label: string;
  rulerMax: number;
  marks?: RulerMark[];
  diameter?: { inches: number; label: string };
}) {
  const [ppi, setPpi] = useState(DEFAULT_PPI);
  const [calibrated, setCalibrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draftPpi, setDraftPpi] = useState(DEFAULT_PPI);

  useEffect(() => {
    const stored = readStoredPpi();
    if (stored === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de localStorage al montar (API solo de cliente)
    setPpi(stored);
    setCalibrated(true);
    setDraftPpi(stored);
  }, []);

  // Si la familia es muy larga, se reduce la escala para no romper el layout.
  const naturalHeight = rulerMax * ppi;
  const fitsRealScale = naturalHeight <= MAX_TAPE_PX;
  const pxPerInch = fitsRealScale ? ppi : MAX_TAPE_PX / rulerMax;
  const tapeHeight = rulerMax * pxPerInch;

  const totalEighths = Math.round(rulerMax * 8);
  const others = marks.filter((m) => m.inches !== inches);

  // El círculo del grosor comparte la misma escala calibrada que el largo,
  // pero con un tope propio: un tornillo grueso a un ppi alto crecería mucho
  // más que la columna angosta de la regla.
  const DIAMETER_MAX_PX = 74;
  const diameterPxRaw = diameter ? diameter.inches * pxPerInch : 0;
  const diameterPx = Math.min(diameterPxRaw, DIAMETER_MAX_PX);
  const diameterCapped = diameterPxRaw > DIAMETER_MAX_PX;

  function saveCalibration() {
    try {
      localStorage.setItem(STORAGE_KEY, String(draftPpi));
    } catch {
      /* si el navegador bloquea el almacenamiento, al menos aplica en esta visita */
    }
    setPpi(draftPpi);
    setCalibrated(true);
    setPanelOpen(false);
  }

  function resetCalibration() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorar */
    }
    setPpi(DEFAULT_PPI);
    setDraftPpi(DEFAULT_PPI);
    setCalibrated(false);
    setPanelOpen(false);
  }

  return (
    <div className="shrink-0 w-[92px] flex flex-col">
      <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">
        {fitsRealScale ? "Tamaño real" : "Escala"}
      </div>

      <div className="flex gap-1.5" style={{ height: tapeHeight }}>
        {/* CINTA GRADUADA */}
        <div className="relative flex-1 bg-[#FAFAFA] border border-diose-border-light overflow-hidden">
          <div
            className="absolute left-0 top-0 w-full bg-gradient-to-b from-diose-amber/25 to-diose-amber/5 animate-grow-down"
            style={{ height: inches * pxPerInch }}
          />

          {Array.from({ length: totalEighths + 1 }, (_, i) => {
            const isInch = i % 8 === 0;
            const isHalf = i % 4 === 0;
            const isQuarter = i % 2 === 0;
            const tickWidth = isInch ? 16 : isHalf ? 11 : isQuarter ? 7 : 4;
            return (
              <div key={i}>
                <div
                  className={`absolute left-0 ${isInch ? "bg-diose-black" : "bg-gray-300"}`}
                  style={{ top: (i / 8) * pxPerInch, width: tickWidth, height: 1 }}
                />
                {isHalf && (
                  <span
                    className="absolute text-[9px] text-gray-400 leading-none"
                    style={{ left: 19, top: (i / 8) * pxPerInch - 4 }}
                  >
                    {fractionLabel(i)}
                  </span>
                )}
              </div>
            );
          })}

          {others.map((m) => (
            <div
              key={m.label}
              className="absolute right-0 border-t border-dashed border-gray-300"
              style={{ top: m.inches * pxPerInch, width: 22 }}
            />
          ))}

          <div
            className="absolute left-0 w-full border-t-2 border-diose-amber animate-slide-in-left"
            style={{ top: inches * pxPerInch - 1 }}
          />
        </div>

        {/* TORNILLO A ESCALA — para comparar contra la pieza física */}
        <div className="relative w-6 shrink-0">
          <div
            className="absolute left-0 right-0 mx-auto bg-diose-black animate-slide-in-left"
            style={{ top: 0, width: 20, height: 5 }}
          />
          <div
            className="absolute left-0 right-0 mx-auto animate-grow-down"
            style={{
              top: 5,
              width: 9,
              height: Math.max(0, inches * pxPerInch - 5),
              background: "repeating-linear-gradient(180deg, #101010 0 3px, #4b4b4b 3px 5px)",
            }}
          />
        </div>
      </div>

      {diameter && (
        <div className="mt-3 pt-3 border-t border-diose-border-light flex flex-col items-center gap-1.5">
          <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 self-start">
            Grosor
          </div>
          <div
            className="rounded-full border-2 border-diose-black bg-gradient-to-br from-gray-300 to-gray-500 animate-scale-in shrink-0"
            style={{ width: diameterPx, height: diameterPx }}
          />
          <div className="text-[10px] text-gray-500 text-center leading-tight">
            {diameter.label} · {formatMm(diameter.inches)}
          </div>
          {diameterCapped && (
            <div className="text-[9px] text-gray-300 text-center leading-tight">(dibujo a escala reducida)</div>
          )}
        </div>
      )}

      <div className="mt-1.5">
        <div className="text-[11px] font-semibold text-diose-black leading-tight">{label}</div>
        <div className="text-[10px] text-gray-400 leading-tight">{formatMm(inches)}</div>
        <button
          onClick={() => {
            setDraftPpi(ppi);
            setPanelOpen(true);
          }}
          className="mt-1.5 text-[10px] text-diose-amber underline cursor-pointer text-left leading-tight"
        >
          {calibrated ? "Reajustar a mi pantalla" : "Ajustar a tamaño real"}
        </button>
      </div>

      {panelOpen && (
        <CalibrationPanel
          draftPpi={draftPpi}
          setDraftPpi={setDraftPpi}
          inches={inches}
          label={label}
          onSave={saveCalibration}
          onReset={resetCalibration}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}

function CalibrationPanel({
  draftPpi,
  setDraftPpi,
  inches,
  label,
  onSave,
  onReset,
  onClose,
}: {
  draftPpi: number;
  setDraftPpi: (v: number) => void;
  inches: number;
  label: string;
  onSave: () => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const cardWidth = (CARD_WIDTH_MM / MM_PER_INCH) * draftPpi;
  const cardHeight = (CARD_HEIGHT_MM / MM_PER_INCH) * draftPpi;
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640;
  // A ppi altos la tarjeta (acostada, en pantallas anchas) o el conjunto
  // completo se vuelve más ancho que el panel. En vez de dejarlo desbordarse
  // y verse roto, se escala la vista previa completa para que siempre quepa
  // — el valor de calibración numérico no cambia, solo el dibujo.
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const container = previewRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const measure = () => {
      const available = container.clientWidth;
      const needed = content.scrollWidth;
      setPreviewScale(needed > available ? Math.max(0.35, available / needed) : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [cardWidth, isSmallScreen]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
      {/* El control queda fijo abajo: en celular la tarjeta a tamaño real es
          muy alta y si el slider se va con el scroll no puedes comparar y
          ajustar al mismo tiempo. */}
      <div className="bg-white w-full max-w-md flex flex-col max-h-[92vh]">
        <div className="px-5 pt-5 pb-3 shrink-0">
          <div className="font-heading text-lg text-diose-black mb-1">Ajustar a tamaño real</div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Apoya una tarjeta (INE, débito o crédito) en la pantalla y mueve el control hasta que coincida con el
            rectángulo — o hasta que la pieza mida igual que tu tornillo de {label}. Se guarda en este dispositivo,
            así que ajústalo también en tu celular.
          </p>
          {isSmallScreen && (
            <p className="text-[11px] text-diose-amber mt-2 leading-relaxed">
              Para mayor precisión, si puedes, hazlo desde una computadora — la pantalla es más grande y es más
              fácil comparar contra la tarjeta.
            </p>
          )}
        </div>

        <div ref={previewRef} className="flex-1 overflow-hidden px-5 flex items-center justify-center">
        <div
          ref={contentRef}
          className="border border-diose-border-light bg-[#FAFAFA] p-4 flex flex-col items-center gap-4 shrink-0"
          style={{ transform: `scale(${previewScale})`, transformOrigin: "center" }}
        >
          {/* En celular la tarjeta va vertical: acostada no cabe a lo ancho. */}
          <div
            className="hidden sm:flex border-2 border-diose-amber bg-white shrink-0 items-end justify-end p-1.5"
            style={{ width: cardWidth, height: cardHeight, borderRadius: cardHeight * 0.06 }}
          >
            <span className="text-[9px] text-gray-400 tracking-[0.1em] uppercase whitespace-nowrap">Tarjeta</span>
          </div>
          <div
            className="flex sm:hidden border-2 border-diose-amber bg-white shrink-0 items-end justify-center p-1.5"
            style={{ width: cardHeight, height: cardWidth, borderRadius: cardHeight * 0.06 }}
          >
            <span className="text-[9px] text-gray-400 tracking-[0.1em] uppercase whitespace-nowrap">Tarjeta</span>
          </div>

          <div className="flex items-start gap-2 shrink-0">
            <div className="relative w-6 shrink-0" style={{ height: inches * draftPpi }}>
              <div
                className="absolute left-0 right-0 mx-auto bg-diose-black"
                style={{ top: 0, width: 20, height: 5 }}
              />
              <div
                className="absolute left-0 right-0 mx-auto"
                style={{
                  top: 5,
                  width: 9,
                  height: Math.max(0, inches * draftPpi - 5),
                  background: "repeating-linear-gradient(180deg, #101010 0 3px, #4b4b4b 3px 5px)",
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 self-center whitespace-nowrap">{label}</span>
          </div>
        </div>
        </div>
        {previewScale < 1 && (
          <div className="px-5 -mt-2">
            <span className="text-[10px] text-gray-300">Vista previa a escala reducida para que quepa en pantalla</span>
          </div>
        )}

        <div className="px-5 pt-3 pb-5 border-t border-diose-border-light shrink-0 bg-white">
        <input
          type="range"
          min={MIN_PPI}
          max={MAX_PPI}
          step={1}
          value={draftPpi}
          onChange={(e) => setDraftPpi(Number(e.target.value))}
          className="w-full accent-diose-amber cursor-pointer"
        />
        <div className="flex items-center justify-between mt-1 mb-4">
          <button
            onClick={() => setDraftPpi(Math.max(MIN_PPI, draftPpi - 1))}
            className="text-xs text-gray-500 border border-diose-border px-2 py-1 cursor-pointer"
          >
            −
          </button>
          <span className="text-[11px] text-gray-400">1 pulgada = {draftPpi} px</span>
          <button
            onClick={() => setDraftPpi(Math.min(MAX_PPI, draftPpi + 1))}
            className="text-xs text-gray-500 border border-diose-border px-2 py-1 cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={onReset} className="px-4 py-2 text-xs text-gray-500 border border-diose-border cursor-pointer">
            Restablecer
          </button>
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-600 border border-diose-border cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-2 text-xs font-semibold cursor-pointer transition-colors"
          >
            Guardar
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
