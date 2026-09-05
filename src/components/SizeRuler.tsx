"use client";

import { formatMm } from "@/lib/measures";
import { useScreenCalibration } from "@/lib/screenCalibration";
import CalibrationPanel from "./CalibrationPanel";

export type RulerMark = { label: string; inches: number };

/** Alto máximo que puede ocupar la cinta antes de reducir la escala. */
const MAX_TAPE_PX = 560;

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
  const cal = useScreenCalibration();
  const { ppi, calibrated, panelOpen, draftPpi, setDraftPpi, openPanel, closePanel, saveCalibration, resetCalibration } = cal;

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
          onClick={openPanel}
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
          onClose={closePanel}
        />
      )}
    </div>
  );
}
