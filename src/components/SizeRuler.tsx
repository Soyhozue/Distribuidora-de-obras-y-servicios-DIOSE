import { formatMm } from "@/lib/measures";

function fractionLabel(eighths: number): string {
  const whole = Math.floor(eighths / 8);
  const rest = eighths % 8;
  const fraction = rest === 0 ? "" : rest === 4 ? "½" : rest === 2 ? "¼" : rest === 6 ? "¾" : "";
  if (!fraction) return String(whole);
  return whole === 0 ? fraction : `${whole}${fraction}`;
}

export type RulerMark = { label: string; inches: number };

/**
 * Cinta métrica vertical junto a la foto del producto. Marca todas las medidas
 * disponibles de la familia sobre la misma escala y resalta la seleccionada,
 * para comparar de un vistazo qué tan largo es cada tornillo.
 */
export default function SizeRuler({
  inches,
  label,
  rulerMax,
  marks = [],
}: {
  inches: number;
  label: string;
  rulerMax: number;
  marks?: RulerMark[];
}) {
  const totalEighths = Math.round(rulerMax * 8);
  const pct = (value: number) => `${(value / rulerMax) * 100}%`;
  const others = marks.filter((m) => m.inches !== inches);

  return (
    <div className="shrink-0 w-[86px] self-stretch flex flex-col">
      <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">Medida</div>

      <div className="relative flex-1 bg-[#FAFAFA] border border-diose-border-light overflow-hidden">
        {/* tramo de la medida seleccionada: se dibuja de arriba hacia abajo */}
        <div
          className="absolute left-0 top-0 w-full bg-gradient-to-b from-diose-amber/25 to-diose-amber/5 animate-grow-down"
          style={{ height: pct(inches) }}
        />

        {/* graduación de la cinta */}
        {Array.from({ length: totalEighths + 1 }, (_, i) => {
          const isInch = i % 8 === 0;
          const isHalf = i % 4 === 0;
          const isQuarter = i % 2 === 0;
          const tickWidth = isInch ? 18 : isHalf ? 12 : isQuarter ? 8 : 5;
          return (
            <div key={i}>
              <div
                className={`absolute left-0 ${isInch ? "bg-diose-black" : "bg-gray-300"}`}
                style={{ top: pct(i / 8), width: tickWidth, height: 1 }}
              />
              {isHalf && (
                <span
                  className="absolute text-[9px] text-gray-400 leading-none"
                  style={{ left: 21, top: `calc(${pct(i / 8)} - 4px)` }}
                >
                  {fractionLabel(i)}
                </span>
              )}
            </div>
          );
        })}

        {/* las demás medidas disponibles, para comparar */}
        {others.map((m) => (
          <div key={m.label}>
            <div
              className="absolute right-0 border-t border-dashed border-gray-300"
              style={{ top: pct(m.inches), width: 30 }}
            />
            <span
              className="absolute text-[9px] text-gray-300 leading-none"
              style={{ right: 2, top: `calc(${pct(m.inches)} + 3px)` }}
            >
              {m.label}
            </span>
          </div>
        ))}

        {/* medida seleccionada */}
        <div
          className="absolute left-0 w-full border-t-2 border-diose-amber animate-slide-in-left"
          style={{ top: `calc(${pct(inches)} - 1px)` }}
        />
        <div
          className="absolute bg-diose-amber text-white text-[10px] font-semibold px-1.5 py-0.5 animate-slide-in-left"
          style={{ left: 4, top: `calc(${pct(inches)} + 4px)` }}
        >
          {label}
        </div>
      </div>

      <div className="mt-1.5 text-[10px] text-gray-400 leading-tight">{formatMm(inches)}</div>
    </div>
  );
}
