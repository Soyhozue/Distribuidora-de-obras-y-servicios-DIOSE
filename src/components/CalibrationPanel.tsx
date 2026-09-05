"use client";

import { useEffect, useRef, useState } from "react";
import { CARD_WIDTH_MM, CARD_HEIGHT_MM, MM_PER_INCH, MIN_PPI, MAX_PPI } from "@/lib/screenCalibration";

export default function CalibrationPanel({
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
