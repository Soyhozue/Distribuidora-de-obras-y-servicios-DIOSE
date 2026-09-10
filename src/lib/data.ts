import bcrypt from "bcryptjs";
import { randomUUID, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/data/products";
import type { ProductIconKey } from "@/components/icons";
import { formatPrice } from "@/lib/currency";

export function pickIcon(categoryName: string): ProductIconKey {
  const map: Record<string, ProductIconKey> = {
    Herramientas: "drill",
    Materiales: "cement",
    Electricidad: "cable",
    Plomería: "hose",
    Pintura: "paint",
    Seguridad: "fire",
  };
  return map[categoryName] ?? "wrench";
}

type DbProduct = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  benefits: string[];
  applications: string[];
  characteristics: string[];
  price: { toString(): string };
  unit: string | null;
  weight?: number | null;
  stock: number;
  stockStatus: string;
  categoryId: string;
  brandId: string;
  subcategoryId?: string | null;
  category: { name: string };
  brand: { name: string };
  subcategory?: { name: string } | null;
  featured: boolean;
  images: string[];
  variantGroupId?: string | null;
  variantLabel?: string | null;
  variantOrder?: number;
  minOrderQty?: number;
  packLabel?: string | null;
  diameterLabel?: string | null;
};

function mapProduct(p: DbProduct): Product & { categoryId: string; brandId: string } {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    brand: p.brand.name,
    category: p.category.name,
    categoryId: p.categoryId,
    brandId: p.brandId,
    subcategoryId: p.subcategoryId ?? undefined,
    subcategory: p.subcategory?.name ?? undefined,
    price: Number(p.price.toString()),
    unit: p.unit ?? undefined,
    weight: p.weight ?? undefined,
    stock: p.stock,
    stockStatus: p.stockStatus as Product["stockStatus"],
    icon: pickIcon(p.category.name),
    description: p.description ?? undefined,
    benefits: p.benefits,
    applications: p.applications,
    characteristics: p.characteristics,
    featured: p.featured,
    images: p.images,
    variantGroupId: p.variantGroupId ?? undefined,
    variantLabel: p.variantLabel ?? undefined,
    variantOrder: p.variantOrder ?? 0,
    minOrderQty: p.minOrderQty ?? 1,
    packLabel: p.packLabel ?? undefined,
    diameterLabel: p.diameterLabel ?? undefined,
  };
}

const STOREFRONT_WHERE = { OR: [{ variantGroupId: null }, { isPrimaryVariant: true }] };
const PRODUCT_INCLUDE = { category: true, brand: true, subcategory: true };

export type ManagedProduct = Product & { categoryId: string; brandId: string };

export async function getAllProducts(): Promise<ManagedProduct[]> {
  const products = await prisma.product.findMany({
    include: PRODUCT_INCLUDE,
    // Agrupado por categoría primero para que nunca se mezclen productos de
    // categorías distintas en la lista del admin — sortOrder (y luego
    // nombre) solo decide el orden DENTRO de cada categoría. Un producto
    // nuevo siempre cae junto a los de su propia categoría.
    orderBy: [{ category: { name: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return products.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { featured: true, ...STOREFRONT_WHERE },
    include: PRODUCT_INCLUDE,
    take: 4,
  });
  return products.map(mapProduct);
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: STOREFRONT_WHERE,
    include: PRODUCT_INCLUDE,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return products.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: PRODUCT_INCLUDE,
  });
  return product ? mapProduct(product) : null;
}

export type ProductVariant = {
  id: string;
  variantLabel: string | null;
  price: number;
  stockStatus: "EN_STOCK" | "STOCK_BAJO" | "AGOTADO";
};

export async function getProductVariants(variantGroupId: string): Promise<ProductVariant[]> {
  // Includes the current product too, always in the same fixed order (the
  // one the admin set), so the buttons stay in place no matter which variant
  // is active.
  const rows = await prisma.product.findMany({
    where: { variantGroupId },
    select: { id: true, variantLabel: true, price: true, stockStatus: true },
    orderBy: [{ variantOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    variantLabel: r.variantLabel,
    price: Number(r.price.toString()),
    stockStatus: r.stockStatus as ProductVariant["stockStatus"],
  }));
}

export async function getRelatedProducts(categoryName: string, excludeId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category: { name: categoryName }, id: { not: excludeId }, ...STOREFRONT_WHERE },
    include: PRODUCT_INCLUDE,
    take: 4,
  });
  return products.map(mapProduct);
}

export type ScrewFinderOption = { id: string; name: string; diameterLabel: string; variantLabel: string };

/**
 * Combinaciones grosor+medida disponibles para el buscador de tornillería del
 * inicio. Solo entran productos con ambos campos puestos y que sí se venden
 * (no variantes agotadas de otra medida ocultas por STOREFRONT_WHERE — aquí
 * se listan TODAS las medidas, agotadas incluidas, para no ocultar del
 * buscador algo que simplemente no está seleccionado por default).
 */
export async function getScrewFinderOptions(): Promise<ScrewFinderOption[]> {
  const rows = await prisma.product.findMany({
    where: {
      diameterLabel: { not: null },
      variantLabel: { not: null },
      category: { name: { contains: "tornill", mode: "insensitive" } },
    },
    select: { id: true, name: true, diameterLabel: true, variantLabel: true },
  });
  return rows
    .filter((r): r is typeof r & { diameterLabel: string; variantLabel: string } => !!r.diameterLabel && !!r.variantLabel)
    .map((r) => ({ id: r.id, name: r.name, diameterLabel: r.diameterLabel, variantLabel: r.variantLabel }));
}

export async function getSubcategories(): Promise<
  { id: string; name: string; categoryId: string; categoryName: string; count: number }[]
> {
  const rows = await prisma.subcategory.findMany({
    include: { _count: { select: { products: true } }, category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    categoryId: r.categoryId,
    categoryName: r.category.name,
    count: r._count.products,
  }));
}

export type ProductInput = {
  sku: string;
  name: string;
  description?: string;
  benefits?: string[];
  applications?: string[];
  characteristics?: string[];
  price: number;
  unit?: string;
  weight?: number;
  stock: number;
  stockStatus: "EN_STOCK" | "STOCK_BAJO" | "AGOTADO";
  categoryId: string;
  subcategoryId?: string;
  brandId: string;
  featured?: boolean;
  images?: string[];
  variantGroupId?: string;
  variantLabel?: string;
  variantOrder?: number;
  minOrderQty?: number;
  packLabel?: string;
  diameterLabel?: string;
};

function validateProductInput(input: ProductInput) {
  if (!input.name?.trim()) throw new Error("El nombre es obligatorio.");
  if (!input.sku?.trim()) throw new Error("El SKU es obligatorio.");
  if (!input.categoryId) throw new Error("Selecciona una categoría.");
  if (!input.brandId) throw new Error("Selecciona una marca.");
  if (!Number.isFinite(input.price) || input.price <= 0) throw new Error("El precio debe ser mayor a 0.");
  if (!Number.isFinite(input.stock) || input.stock < 0) throw new Error("El stock no puede ser negativo.");
  if (input.weight != null && (!Number.isFinite(input.weight) || input.weight < 0)) {
    throw new Error("El peso no puede ser negativo.");
  }
  if (input.minOrderQty != null && (!Number.isInteger(input.minOrderQty) || input.minOrderQty < 1)) {
    throw new Error("La cantidad mínima de venta debe ser un número entero de al menos 1.");
  }
}

async function resolveIsPrimaryVariant(variantGroupId: string | undefined, excludeId?: string): Promise<boolean> {
  if (!variantGroupId) return true;
  const existingPrimary = await prisma.product.findFirst({
    where: { variantGroupId, isPrimaryVariant: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return !existingPrimary;
}

export async function createProduct(input: ProductInput) {
  validateProductInput(input);
  const isPrimaryVariant = await resolveIsPrimaryVariant(input.variantGroupId);
  try {
    return await prisma.product.create({ data: { ...input, isPrimaryVariant } });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      throw new Error("Ya existe un producto con ese SKU.");
    }
    throw err;
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  validateProductInput(input);
  const before = await prisma.product.findUnique({
    where: { id },
    select: { variantGroupId: true, isPrimaryVariant: true },
  });
  const isPrimaryVariant = await resolveIsPrimaryVariant(input.variantGroupId, id);
  try {
    const updated = await prisma.product.update({ where: { id }, data: { ...input, isPrimaryVariant } });
    if (before?.isPrimaryVariant && before.variantGroupId && before.variantGroupId !== (input.variantGroupId ?? null)) {
      const nextPrimary = await prisma.product.findFirst({
        where: { variantGroupId: before.variantGroupId },
        orderBy: [{ variantOrder: "asc" }, { createdAt: "asc" }],
      });
      if (nextPrimary) {
        await prisma.product.update({ where: { id: nextPrimary.id }, data: { isPrimaryVariant: true } });
      }
    }
    return updated;
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      throw new Error("Ya existe un producto con ese SKU.");
    }
    throw err;
  }
}

/**
 * Persists the admin's drag-and-drop order for the top-level product list
 * (one row per standalone product, or per variant family). A family's
 * position is one value shared by every member — the storefront and admin
 * list only ever show the primary variant, but sortOrder is written to all
 * of them so whichever member Prisma happens to return first still carries
 * the right value.
 */
export async function reorderProducts(rows: { kind: "single" | "family"; id: string }[]) {
  await prisma.$transaction(
    rows.map((row, index) =>
      row.kind === "single"
        ? prisma.product.update({ where: { id: row.id }, data: { sortOrder: index } })
        : prisma.product.updateMany({ where: { variantGroupId: row.id }, data: { sortOrder: index } })
    )
  );
}

export async function updateProductStock(id: string, stock: number) {
  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("El stock no puede ser negativo.");
  }
  const stockStatus = stock === 0 ? "AGOTADO" : stock <= 10 ? "STOCK_BAJO" : "EN_STOCK";
  return prisma.product.update({ where: { id }, data: { stock, stockStatus } });
}

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Statuses in which stock is considered "committed" — already taken out of
// inventory because the order is real (paid, or confirmed by an admin for
// cash/transfer/WhatsApp orders).
const STOCK_COMMITTED_STATUSES = ["CONFIRMADO", "EN_CAMINO", "ENTREGADO"];

export type LowStockAlert = { name: string; sku: string; stock: number; stockStatus: "STOCK_BAJO" | "AGOTADO" };

function computeStockStatus(stock: number): "EN_STOCK" | "STOCK_BAJO" | "AGOTADO" {
  return stock === 0 ? "AGOTADO" : stock <= 10 ? "STOCK_BAJO" : "EN_STOCK";
}

// Updates the cached stockStatus label and reports back only when stock
// just crossed INTO "bajo"/"agotado" (not every time it's touched while
// already there) — the caller uses this to email the owner once per dip,
// not once per sale.
async function refreshStockStatus(tx: PrismaTx, productId: string): Promise<LowStockAlert | null> {
  const p = await tx.product.findUniqueOrThrow({
    where: { id: productId },
    select: { stock: true, stockStatus: true, name: true, sku: true },
  });
  const newStatus = computeStockStatus(p.stock);
  await tx.product.update({ where: { id: productId }, data: { stockStatus: newStatus } });

  const justCrossedIntoLow = newStatus !== "EN_STOCK" && newStatus !== p.stockStatus;
  if (!justCrossedIntoLow) return null;
  return { name: p.name, sku: p.sku, stock: p.stock, stockStatus: newStatus };
}

// Atomic conditional decrement: only succeeds if there's still enough stock
// at the moment it runs, closing the race where two concurrent orders both
// pass an earlier "is there stock?" check and both get confirmed.
async function decrementStockAtomic(tx: PrismaTx, productId: string, quantity: number, orderNumber: number) {
  const result = await tx.product.updateMany({
    where: { id: productId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });
  if (result.count === 0) {
    throw new Error(`Stock insuficiente para confirmar el pedido #${orderNumber}.`);
  }
  return refreshStockStatus(tx, productId);
}

async function restockAtomic(tx: PrismaTx, productId: string, quantity: number) {
  await tx.product.update({ where: { id: productId }, data: { stock: { increment: quantity } } });
  await refreshStockStatus(tx, productId);
}

/**
 * Moves inventory in or out as an order's status crosses into or out of the
 * "committed" group (CONFIRMADO/EN_CAMINO/ENTREGADO). Called from both the
 * admin status update and the Mercado Pago webhook so stock is only ever
 * touched once per order, at the moment it's actually confirmed sold.
 * Returns any products that just dropped into low/no stock, so the caller
 * can email the owner once the transaction has committed.
 */
async function applyOrderStatusStockEffects(
  tx: PrismaTx,
  orderId: string,
  oldStatus: string,
  newStatus: string
): Promise<LowStockAlert[]> {
  if (oldStatus === newStatus) return [];
  const wasCommitted = STOCK_COMMITTED_STATUSES.includes(oldStatus);
  const isCommitted = STOCK_COMMITTED_STATUSES.includes(newStatus);
  if (wasCommitted === isCommitted) return [];

  const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return [];

  const alerts: LowStockAlert[] = [];
  if (!wasCommitted && isCommitted) {
    for (const item of order.items) {
      const alert = await decrementStockAtomic(tx, item.productId, item.quantity, order.number);
      if (alert) alerts.push(alert);
    }
  } else if (wasCommitted && !isCommitted) {
    for (const item of order.items) {
      await restockAtomic(tx, item.productId, item.quantity);
    }
  }
  return alerts;
}

// Fire-and-forget: called after the stock-changing transaction has already
// committed, so a slow or failed email never holds up confirming an order.
async function notifyLowStock(alerts: LowStockAlert[]) {
  if (alerts.length === 0) return;
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings?.email) return;
    const { sendLowStockAlert } = await import("./email");
    await sendLowStockAlert(settings.email, alerts);
  } catch (err) {
    const { reportError } = await import("./errorReporting");
    await reportError("No se pudo enviar la alerta de stock bajo:", err);
  }
}

export async function deleteProduct(id: string) {
  const hasOrderHistory = await prisma.orderItem.findFirst({ where: { productId: id } });
  if (hasOrderHistory) {
    throw new Error(
      "No se puede eliminar: este producto aparece en pedidos ya realizados. Márcalo como \"Agotado\" en vez de eliminarlo para conservar el historial de esos pedidos."
    );
  }
  const product = await prisma.product.findUnique({
    where: { id },
    select: { variantGroupId: true, isPrimaryVariant: true },
  });
  await prisma.comboItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  if (product?.isPrimaryVariant && product.variantGroupId) {
    const nextPrimary = await prisma.product.findFirst({
      where: { variantGroupId: product.variantGroupId },
      orderBy: [{ variantOrder: "asc" }, { createdAt: "asc" }],
    });
    if (nextPrimary) {
      await prisma.product.update({ where: { id: nextPrimary.id }, data: { isPrimaryVariant: true } });
    }
  }
}

export async function getVariantGroups(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { variantGroupId: { not: null } },
    select: { variantGroupId: true },
    distinct: ["variantGroupId"],
  });
  return rows
    .map((r) => r.variantGroupId)
    .filter((g): g is string => !!g && g.trim().length > 0)
    .sort();
}

export async function getCategoryOptions() {
  return prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function getBrandOptions() {
  return prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return categories.map((c) => ({ name: c.name, count: c._count.products }));
}

export async function getBrandsWithCounts() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return brands.map((b) => ({ name: b.name, count: b._count.products }));
}

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  paymentMethod: "TARJETA" | "TRANSFERENCIA" | "EFECTIVO" | "WHATSAPP";
  items: { productId: string; quantity: number; unitPrice: number }[];
  couponCode?: string;
  invoice?: {
    rfc: string;
    name: string;
    zip: string;
    regime: string;
    cfdiUse: string;
  };
};

const SHIPPING_RATES = [
  { max: 1, p: 120 }, { max: 3, p: 180 }, { max: 5, p: 250 },
  { max: 10, p: 350 }, { max: 20, p: 500 }, { max: Infinity, p: 700 },
];

function isJuarezCity(city: string) {
  return ["juárez", "juarez", "cd. juárez", "ciudad juárez", "ciudad juarez"].some((k) =>
    city.toLowerCase().includes(k)
  );
}

export async function createOrder(input: CreateOrderInput, sessionUserId?: string) {
  // Never trust a client-supplied unit price — a tampered request could set
  // any price it wants. Re-derive every line from the product's real,
  // current price in the database.
  const priceRows = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) } },
    select: { id: true, price: true },
  });
  const priceById = new Map(priceRows.map((p) => [p.id, Number(p.price)]));
  const items = input.items.map((i) => {
    const price = priceById.get(i.productId);
    if (price === undefined) throw new Error("Producto no encontrado.");
    return { ...i, unitPrice: price };
  });

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  let shipping = 0;
  if (input.items.length > 0 && !isJuarezCity(input.city)) {
    const weights = await prisma.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) } },
      select: { id: true, weight: true },
    });
    const totalWeight = input.items.reduce((sum, i) => {
      const w = weights.find((p) => p.id === i.productId)?.weight ?? 0;
      return sum + w * i.quantity;
    }, 0);
    if (totalWeight > 0) {
      shipping = (SHIPPING_RATES.find((r) => totalWeight <= r.max) ?? SHIPPING_RATES[SHIPPING_RATES.length - 1]).p;
    }
  }

  // Never trust a client-supplied discount amount — re-derive it here from
  // the coupon's real, current record.
  let discount = 0;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
    if (coupon && coupon.active) {
      discount = Math.round(subtotal * Number(coupon.discount));
    }
  }

  const total = Math.max(0, subtotal + shipping - discount);

  // A session can outlive the account it points to (e.g. the user record
  // was deleted while the browser still holds a valid signed cookie) —
  // treat that the same as no session instead of crashing the order.
  const sessionUser = sessionUserId
    ? await prisma.user.update({
        where: { id: sessionUserId },
        data: { phone: input.customerPhone ?? undefined },
      }).catch(() => null)
    : null;

  let userId: string;
  if (sessionUser) {
    userId = sessionUser.id;
  } else {
    // Guest checkout — reuse the account if this email already exists, but
    // never overwrite an existing user's stored name/phone from an
    // unauthenticated request (anyone could type someone else's email).
    const existing = await prisma.user.findUnique({ where: { email: input.customerEmail } });
    if (existing) {
      userId = existing.id;
    } else {
      // Unguessable per-account password; guests never log in with it directly.
      const guestPassword = await bcrypt.hash(randomUUID(), 10);
      const user = await prisma.user.create({
        data: {
          name: input.customerName,
          email: input.customerEmail,
          phone: input.customerPhone,
          password: guestPassword,
        },
      });
      userId = user.id;
    }
  }

  const address = await prisma.address.create({
    data: {
      userId,
      street: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.zip,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId,
      addressId: address.id,
      paymentMethod: input.paymentMethod,
      subtotal,
      shipping,
      discount,
      total,
      wantsInvoice: !!input.invoice,
      invoiceRfc: input.invoice?.rfc,
      invoiceName: input.invoice?.name,
      invoiceZip: input.invoice?.zip,
      invoiceRegime: input.invoice?.regime,
      invoiceCfdiUse: input.invoice?.cfdiUse,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  return order;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADO: "Confirmado",
    EN_CAMINO: "Enviado",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };
  return labels[status] ?? status;
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return orders.map((o) => ({
    id: o.id,
    number: o.number,
    date: o.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
    client: o.user.name,
    total: Number(o.total.toString()),
    status: o.status,
    statusLabel: statusLabel(o.status),
    wantsInvoice: o.wantsInvoice,
  }));
}

export async function getDashboardStats() {
  const [totalOrders, pendingOrders, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.order.aggregate({
      // Solo pedidos ya confirmados (pago recibido) cuentan como ingreso real
      // — uno PENDIENTE todavía no se cobró, y contarlo infla la cifra.
      where: { status: { in: ["CONFIRMADO", "EN_CAMINO", "ENTREGADO"] } },
      _sum: { total: true },
    }),
  ]);
  return {
    totalOrders,
    pendingOrders,
    revenue: Number(revenue._sum.total ?? 0),
  };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, address: true, items: { include: { product: true } } },
  });
  if (!order) return null;
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    statusLabel: statusLabel(order.status),
    internalNotes: order.internalNotes ?? "",
    notifyWhatsapp: order.notifyWhatsapp,
    invoice: order.wantsInvoice
      ? {
          rfc: order.invoiceRfc ?? "",
          name: order.invoiceName ?? "",
          zip: order.invoiceZip ?? "",
          regime: order.invoiceRegime ?? "",
          cfdiUse: order.invoiceCfdiUse ?? "",
        }
      : null,
    total: Number(order.total.toString()),
    createdAt: order.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
    customer: {
      name: order.user.name,
      phone: order.user.phone ?? "",
      email: order.user.email,
      address: order.address
        ? `${order.address.street}, ${order.address.city}, ${order.address.state}`
        : "",
      street: order.address?.street ?? "",
      city: order.address?.city ?? "",
      state: order.address?.state ?? "",
      postalCode: order.address?.postalCode ?? "",
    },
    items: order.items.map((i) => ({
      id: i.id,
      name: i.product.name,
      sku: i.product.sku,
      quantity: i.quantity,
      price: formatPrice(Number(i.unitPrice.toString())),
      image: i.product.images?.[0] ?? null,
    })),
  };
}

export async function createContactMessage(input: {
  name: string;
  phone?: string;
  email: string;
  message: string;
}) {
  return prisma.contactMessage.create({ data: input });
}

export async function registerUser(input: { name: string; email: string; phone?: string; password: string }) {
  if (input.password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Ya existe una cuenta con ese correo");
  }
  const hashed = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { name: input.name, email: input.email, phone: input.phone, password: hashed },
  });
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function lockoutMessage(lockedUntil: Date) {
  const minutesLeft = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60_000));
  return `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft === 1 ? "" : "s"}.`;
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error(lockoutMessage(user.lockedUntil));
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const locked = attempts >= MAX_LOGIN_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: locked ? 0 : attempts,
        lockedUntil: locked ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : null,
      },
    });
    if (locked) throw new Error(lockoutMessage(new Date(Date.now() + LOCKOUT_MINUTES * 60_000)));
    return null;
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }
  return user;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw new Error(lockoutMessage(admin.lockedUntil));
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    const attempts = admin.failedLoginAttempts + 1;
    const locked = attempts >= MAX_LOGIN_ATTEMPTS;
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: locked ? 0 : attempts,
        lockedUntil: locked ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : null,
      },
    });
    if (locked) throw new Error(lockoutMessage(new Date(Date.now() + LOCKOUT_MINUTES * 60_000)));
    return null;
  }

  if (admin.failedLoginAttempts > 0 || admin.lockedUntil) {
    await prisma.admin.update({ where: { id: admin.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }
  return admin;
}

export async function createEmailVerification(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.emailVerification.create({
    data: { userId, token, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) },
  });
  return token;
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.emailVerification.findUnique({ where: { token } });
  if (!record || record.used || record.expiresAt < new Date()) return false;
  await Promise.all([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } }),
  ]);
  return true;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return orders.map((o) => ({
    id: o.id,
    number: o.number,
    date: o.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
    products: o.items.map((i) => i.product.name).join(", "),
    total: Number(o.total.toString()),
    status: statusLabel(o.status),
  }));
}

export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId } });
}

export type CreateComboInput = {
  title: string;
  subtitle?: string;
  type: "COMBO" | "INDIVIDUAL" | "OFERTA" | "BANNER";
  format: string;
  background: string;
  comboPrice?: number;
  savings?: number;
  productIds: string[];
};

export async function createCombo(input: CreateComboInput) {
  return prisma.combo.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      type: input.type,
      format: input.format,
      background: input.background,
      comboPrice: input.comboPrice,
      savings: input.savings,
      items: { create: input.productIds.map((productId) => ({ productId })) },
    },
  });
}

export async function getCombos() {
  const combos = await prisma.combo.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return combos.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    type: c.type,
    format: c.format,
    background: c.background,
    comboPrice: c.comboPrice ? Number(c.comboPrice.toString()) : null,
    savings: c.savings ? Number(c.savings.toString()) : null,
    createdAt: c.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
    products: c.items.map((i) => i.product.name),
  }));
}

export async function deleteCombo(id: string) {
  await prisma.comboItem.deleteMany({ where: { comboId: id } });
  await prisma.combo.delete({ where: { id } });
}

const VALID_ORDER_STATUSES = ["PENDIENTE", "CONFIRMADO", "EN_CAMINO", "ENTREGADO", "CANCELADO"];

/**
 * Marks an order CONFIRMADO after Mercado Pago reports it as paid, and
 * decrements stock for it — idempotent, so a retried webhook notification
 * (Mercado Pago resends until it gets a 200) never double-charges inventory.
 */
export async function confirmPaidOrder(orderId: string) {
  const alerts = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!current || STOCK_COMMITTED_STATUSES.includes(current.status) || current.status === "CANCELADO") {
      return [];
    }
    await tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMADO" } });
    return applyOrderStatusStockEffects(tx, orderId, current.status, "CONFIRMADO");
  });
  await notifyLowStock(alerts);
}

export async function updateOrderStatus(
  id: string,
  data: { status?: string; internalNotes?: string; notifyWhatsapp?: boolean }
) {
  if (data.status && !VALID_ORDER_STATUSES.includes(data.status)) {
    throw new Error("Estado de pedido inválido.");
  }
  let alerts: LowStockAlert[] = [];
  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUniqueOrThrow({ where: { id }, select: { status: true } });
    const result = await tx.order.update({
      where: { id },
      data: {
        status: data.status as never,
        internalNotes: data.internalNotes,
        notifyWhatsapp: data.notifyWhatsapp,
      },
    });
    if (data.status) {
      alerts = await applyOrderStatusStockEffects(tx, id, current.status, data.status);
    }
    return result;
  });
  await notifyLowStock(alerts);
  return updated;
}

export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (existing) return existing;
  try {
    return await prisma.siteSettings.create({ data: { id: "main" } });
  } catch {
    return prisma.siteSettings.findUniqueOrThrow({ where: { id: "main" } });
  }
}

export type HeroGradient = "left" | "flat" | "top" | "bottom";

export type HeroSlide = {
  url: string;
  focusX: number;
  focusY: number;
  zoom: number;
  overlay: number;
  gradient: HeroGradient;
};

const VALID_GRADIENTS: HeroGradient[] = ["left", "flat", "top", "bottom"];

export function parseHeroSlides(value: unknown): HeroSlide[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null && typeof (s as { url?: unknown }).url === "string")
    .map((s) => ({
      url: s.url as string,
      focusX: typeof s.focusX === "number" ? s.focusX : 50,
      focusY: typeof s.focusY === "number" ? s.focusY : 50,
      zoom: typeof s.zoom === "number" ? s.zoom : 100,
      overlay: typeof s.overlay === "number" ? s.overlay : 100,
      gradient: VALID_GRADIENTS.includes(s.gradient as HeroGradient) ? (s.gradient as HeroGradient) : "left",
    }));
}

export type SiteSettingsInput = {
  phone: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  heroSlides: HeroSlide[];
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTitleHighlightColor: string;
  heroSubtitle: string;
  heroCta1Label: string;
  heroCta1Link: string;
  heroCta2Label: string;
  heroCta2Link: string;
  partnerLogoUrl: string;
  partnerName: string;
  aboutEyebrow: string;
  aboutHeroLine1: string;
  aboutHeroLine2: string;
  aboutHeroLine3: string;
  aboutFoundedYear: string;
  aboutHistoryP1: string;
  aboutHistoryP2: string;
  aboutFeature1: string;
  aboutFeature2: string;
  aboutFeature3: string;
  aboutCityLine: string;
  aboutStateLine: string;
  announcementText: string;
  announcementBgColor: string;
  announcementTextColor: string;
  announcementFontSize: number;
  announcementSpeed: number;
  announcementFontFamily: string;
};

export async function updateSiteSettings(input: SiteSettingsInput) {
  return prisma.siteSettings.upsert({
    where: { id: "main" },
    update: input,
    create: { id: "main", ...input },
  });
}

export async function getPromoImages() {
  const promos = await prisma.promoImage.findMany({ orderBy: { order: "asc" } });
  const productIds = [...new Set(promos.map((p) => p.linkedProductId).filter((id): id is string => !!id))];
  if (productIds.length === 0) {
    return promos.map((p) => ({ ...p, linkedProduct: null as Product | null }));
  }
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: PRODUCT_INCLUDE,
  });
  const byId = new Map(products.map((p) => [p.id, mapProduct(p)]));
  return promos.map((p) => ({ ...p, linkedProduct: p.linkedProductId ? byId.get(p.linkedProductId) ?? null : null }));
}

export async function getPromoSectionLabels() {
  const rows = await prisma.promoImage.findMany({
    where: { sectionLabel: { not: null } },
    select: { sectionLabel: true },
    distinct: ["sectionLabel"],
  });
  return rows
    .map((r) => r.sectionLabel)
    .filter((label): label is string => !!label && label.trim().length > 0);
}

export async function createPromoImage(input: {
  imageUrl: string;
  mediaType?: "IMAGE" | "VIDEO";
  title?: string;
  subtitle?: string;
  badgeText?: string;
  sectionLabel?: string;
  link?: string;
  linkedProductId?: string;
}) {
  const count = await prisma.promoImage.count();
  return prisma.promoImage.create({ data: { ...input, order: count } });
}

export async function deletePromoImage(id: string) {
  await prisma.promoImage.delete({ where: { id } });
}

export async function getCustomers() {
  const users = await prisma.user.findMany({
    include: { orders: true },
    orderBy: { createdAt: "desc" },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    createdAt: u.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
    orderCount: u.orders.length,
    totalSpent: u.orders
      .filter((o) => o.status !== "CANCELADO")
      .reduce((sum, o) => sum + Number(o.total.toString()), 0),
  }));
}

export async function deleteCustomer(id: string) {
  const hasOrders = await prisma.order.findFirst({ where: { userId: id } });
  if (hasOrders) {
    throw new Error(
      "No se puede eliminar: este cliente tiene pedidos registrados. Eliminarlo borraría ese historial de compras y facturación."
    );
  }
  await prisma.address.deleteMany({ where: { userId: id } });
  await prisma.passwordReset.deleteMany({ where: { userId: id } });
  await prisma.emailVerification.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
}
