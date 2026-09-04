/**
 * Utilidades para interpretar medidas en pulgadas escritas a mano por el admin
 * (ej. `1/2"`, `5/8"`, `1 1/2"`, `2 pulg`) y convertirlas a milímetros.
 */

const UNICODE_FRACTIONS: Record<string, string> = {
  "½": " 1/2",
  "¼": " 1/4",
  "¾": " 3/4",
  "⅛": " 1/8",
  "⅜": " 3/8",
  "⅝": " 5/8",
  "⅞": " 7/8",
};

/**
 * Devuelve la medida en pulgadas, o null si la etiqueta no es una medida
 * en pulgadas reconocible (ej. "500 ML", "Azul", "1/4 x 1").
 */
export function parseInches(label: string | null | undefined): number | null {
  if (!label) return null;

  let cleaned = label.trim();
  for (const [glyph, replacement] of Object.entries(UNICODE_FRACTIONS)) {
    cleaned = cleaned.split(glyph).join(replacement);
  }
  cleaned = cleaned
    .replace(/["″”]/g, " ")
    .replace(/\bin\b/gi, " ")
    .replace(/\bpulg(adas?)?\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Número entero o decimal: "2", "1.5"
  const decimal = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (decimal) {
    const value = Number(decimal[1]);
    return value > 0 ? value : null;
  }

  // Fracción simple: "5/8"
  const fraction = cleaned.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (denominator <= 0) return null;
    const value = numerator / denominator;
    return value > 0 ? value : null;
  }

  // Número mixto: "1 1/2"
  const mixed = cleaned.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (denominator <= 0) return null;
    const value = whole + numerator / denominator;
    return value > 0 ? value : null;
  }

  return null;
}

export function inchesToMm(inches: number): number {
  return inches * 25.4;
}

export function formatMm(inches: number): string {
  const mm = inchesToMm(inches);
  return `${mm.toFixed(1).replace(/\.0$/, "")} mm`;
}
