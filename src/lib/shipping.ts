const JUAREZ_KEYWORDS = ["juárez", "juarez", "cd. juárez", "cd juárez", "ciudad juárez", "ciudad juarez", "cdjuarez", "j uárez"];

export function isLocalJuarez(city: string): boolean {
  return JUAREZ_KEYWORDS.some((kw) => city.toLowerCase().includes(kw));
}

// Tarifa por peso para envíos fuera de Juárez (MXN)
const WEIGHT_RATES: { maxKg: number; price: number }[] = [
  { maxKg: 1,   price: 120 },
  { maxKg: 3,   price: 180 },
  { maxKg: 5,   price: 250 },
  { maxKg: 10,  price: 350 },
  { maxKg: 20,  price: 500 },
  { maxKg: Infinity, price: 700 },
];

export function calcShipping(totalWeightKg: number, city: string): number {
  if (isLocalJuarez(city)) return 0;
  const rate = WEIGHT_RATES.find((r) => totalWeightKg <= r.maxKg);
  return rate?.price ?? 700;
}

export function shippingLabel(totalWeightKg: number, city: string): string {
  if (totalWeightKg === 0) return "A calcular (sin peso registrado)";
  if (isLocalJuarez(city)) return "Gratis — envío local Juárez";
  return `$${calcShipping(totalWeightKg, city).toLocaleString("es-MX")} MXN`;
}
