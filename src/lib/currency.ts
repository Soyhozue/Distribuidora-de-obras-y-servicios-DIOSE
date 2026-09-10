/**
 * Formato de precio único para todo el sitio — siempre especifica la
 * moneda (pesos mexicanos) para que ningún monto quede ambiguo, en
 * catálogo, carrito, checkout, correos y panel de administración.
 */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("es-MX")} MXN`;
}
