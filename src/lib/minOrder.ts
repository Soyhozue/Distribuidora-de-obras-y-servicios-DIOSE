/**
 * Cantidad mínima de compra de un producto. Si el admin puso un mínimo en
 * pesos (minOrderAmount), este tiene prioridad y la cantidad de piezas se
 * calcula sola según el precio — así un tornillo de $2 y uno de $10 pueden
 * compartir la misma regla de "compra al menos $100" con cantidades
 * distintas. Si no hay mínimo en pesos, se usa el mínimo en piezas de
 * siempre (minOrderQty), o 1 si tampoco hay.
 */
export function effectiveMinOrderQty(product: {
  price: number;
  minOrderQty?: number;
  minOrderAmount?: number;
}): number {
  if (product.minOrderAmount && product.minOrderAmount > 0 && product.price > 0) {
    return Math.max(1, Math.ceil(product.minOrderAmount / product.price));
  }
  return Math.max(1, product.minOrderQty ?? 1);
}
