/**
 * Formato de precio único para todo el sitio — siempre especifica la
 * moneda (pesos mexicanos) para que ningún monto quede ambiguo, en
 * catálogo, carrito, checkout, correos y panel de administración.
 */
export function formatPrice(amount: number): string {
  // Siempre 2 decimales — sin esto, JS recorta ceros de forma inconsistente
  // ($371.2, $1.5, $522) y en una tienda con precios por pieza tan chicos
  // (tornillos a centavos) eso se ve como un error de cálculo, no un redondeo.
  return `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}
