import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/data/products";
import type { ProductIconKey } from "@/components/icons";

function pickIcon(categoryName: string): ProductIconKey {
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
  price: { toString(): string };
  unit: string | null;
  weight?: number | null;
  stock: number;
  stockStatus: string;
  categoryId: string;
  brandId: string;
  category: { name: string };
  brand: { name: string };
  featured: boolean;
  images: string[];
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
    price: Number(p.price.toString()),
    unit: p.unit ?? undefined,
    weight: p.weight ?? undefined,
    stock: p.stock,
    stockStatus: p.stockStatus as Product["stockStatus"],
    icon: pickIcon(p.category.name),
    description: p.description ?? undefined,
    featured: p.featured,
    images: p.images,
  };
}

export type ManagedProduct = Product & { categoryId: string; brandId: string };

export async function getAllProducts(): Promise<ManagedProduct[]> {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { name: "asc" },
  });
  return products.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { featured: true },
    include: { category: true, brand: true },
    take: 4,
  });
  return products.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });
  return product ? mapProduct(product) : null;
}

export async function getRelatedProducts(categoryName: string, excludeId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category: { name: categoryName }, id: { not: excludeId } },
    include: { category: true, brand: true },
    take: 4,
  });
  return products.map(mapProduct);
}

export type ProductInput = {
  sku: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  weight?: number;
  stock: number;
  stockStatus: "EN_STOCK" | "STOCK_BAJO" | "AGOTADO";
  categoryId: string;
  brandId: string;
  featured?: boolean;
  images?: string[];
};

export async function createProduct(input: ProductInput) {
  return prisma.product.create({ data: input });
}

export async function updateProduct(id: string, input: ProductInput) {
  return prisma.product.update({ where: { id }, data: input });
}

export async function updateProductStock(id: string, stock: number) {
  const stockStatus = stock <= 0 ? "AGOTADO" : stock <= 10 ? "STOCK_BAJO" : "EN_STOCK";
  return prisma.product.update({ where: { id }, data: { stock, stockStatus } });
}

export async function deleteProduct(id: string) {
  await prisma.orderItem.deleteMany({ where: { productId: id } });
  await prisma.comboItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
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
  const subtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

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

  const total = subtotal + shipping;

  let userId: string;
  if (sessionUserId) {
    // Logged-in user — link directly, update contact info
    await prisma.user.update({
      where: { id: sessionUserId },
      data: { phone: input.customerPhone ?? undefined },
    });
    userId = sessionUserId;
  } else {
    // Guest checkout — upsert by email
    const user = await prisma.user.upsert({
      where: { email: input.customerEmail },
      update: { name: input.customerName, phone: input.customerPhone },
      create: {
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
        password: "guest-checkout",
      },
    });
    userId = user.id;
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
      total,
      items: {
        create: input.items.map((i) => ({
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
  }));
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
      price: `$${Number(i.unitPrice.toString()).toLocaleString("es-MX")}`,
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
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Ya existe una cuenta con ese correo");
  }
  const hashed = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { name: input.name, email: input.email, phone: input.phone, password: hashed },
  });
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  return user;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return null;
  return admin;
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

export async function updateOrderStatus(
  id: string,
  data: { status?: string; internalNotes?: string; notifyWhatsapp?: boolean }
) {
  return prisma.order.update({
    where: { id },
    data: {
      status: data.status as never,
      internalNotes: data.internalNotes,
      notifyWhatsapp: data.notifyWhatsapp,
    },
  });
}

export async function deleteOrder(id: string) {
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });
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
};

export async function updateSiteSettings(input: SiteSettingsInput) {
  return prisma.siteSettings.upsert({
    where: { id: "main" },
    update: input,
    create: { id: "main", ...input },
  });
}

export async function getPromoImages() {
  return prisma.promoImage.findMany({ orderBy: { order: "asc" } });
}

export async function createPromoImage(input: {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  link?: string;
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
    totalSpent: u.orders.reduce((sum, o) => sum + Number(o.total.toString()), 0),
  }));
}
