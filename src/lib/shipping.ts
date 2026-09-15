import { formatPrice } from "./currency";

const JUAREZ_KEYWORDS = ["juárez", "juarez", "cd. juárez", "cd juárez", "ciudad juárez", "ciudad juarez", "cdjuarez", "j uárez"];

export function isLocalJuarez(city: string): boolean {
  return JUAREZ_KEYWORDS.some((kw) => city.toLowerCase().includes(kw));
}

// Tarifa por peso para envíos fuera de Juárez (MXN) — tomada de cotizaciones
// reales del cotizador de Paquetería Tres Guerras (servicio "Entrega a
// domicilio", el más barato: tú llevas el paquete a su sucursal en Juárez y
// ellos lo entregan en la puerta del cliente), confirmadas el 15-sep-2026.
// Es tarifa plana nacional — se cotizó igual a Guadalajara, CDMX y Hermosillo
// para el mismo peso, así que no depende del destino.
// Los tramos 1-20 kg son precios reales de su cotizador. Arriba de 20 kg no
// hay dato real todavía — ese último tramo es una proyección (misma tasa
// marginal que entre 10 y 20 kg, con margen de sobra) hasta que consigas una
// cotización real para paquetes pesados.
const WEIGHT_RATES: { maxKg: number; price: number }[] = [
  { maxKg: 5,   price: 173 },  // real: $172.84 (tarifa plana 1-5kg)
  { maxKg: 10,  price: 363 },  // real: $363.08
  { maxKg: 20,  price: 487 },  // real: $487.20
  { maxKg: Infinity, price: 750 }, // proyectado — confirma con Tres Guerras para pedidos así de pesados
];

export function calcShipping(totalWeightKg: number, city: string): number {
  if (isLocalJuarez(city)) return 0;
  const rate = WEIGHT_RATES.find((r) => totalWeightKg <= r.maxKg);
  return rate?.price ?? WEIGHT_RATES[WEIGHT_RATES.length - 1].price;
}

export function shippingLabel(totalWeightKg: number, city: string): string {
  if (totalWeightKg === 0) return "A calcular (sin peso registrado)";
  if (isLocalJuarez(city)) return "Gratis — envío local Juárez";
  return formatPrice(calcShipping(totalWeightKg, city));
}

// CP de la sucursal de origen (Ciudad Juárez) que ya usamos para cotizar con
// Tres Guerras — para que el panel de admin pueda mandar al admin derechito
// a su cotizador con los mismos datos.
export const TRES_GUERRAS_ORIGIN_CP = "32000";
export const TRES_GUERRAS_COTIZADOR_URL = "https://tresguerras.com.mx";

// Para el panel de admin: qué tanto confiar en la tarifa mostrada, y qué
// pasos seguir para despacharlo. El último tramo (más de 20kg) es una
// proyección, no un precio confirmado con Tres Guerras — por eso se marca
// aparte, para que el admin lo corrobore con ellos antes de cobrar/enviar.
export function shippingGuidance(totalWeightKg: number, city: string) {
  const isLocal = isLocalJuarez(city);
  const price = calcShipping(totalWeightKg, city);
  const isEstimate = !isLocal && totalWeightKg > 20;
  return { isLocal, price, isEstimate };
}
