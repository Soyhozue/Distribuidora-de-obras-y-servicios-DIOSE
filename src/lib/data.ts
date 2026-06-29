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
  stock: number;
  stockStatus: string;
  categoryId: string;
  brandId: string;
  category: { name: string };
  brand: { name: string };
  featured: boolean;
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
    stock: p.stock,
    stockStatus: p.stockStatus as Product["stockStatus"],
    icon: pickIcon(p.category.name),
    description: p.description ?? undefined,
    featured: p.featured,
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
  stock: number;
  stockStatus: "EN_STOCK" | "STOCK_BAJO" | "AGOTADO";
  categoryId: string;
  brandId: string;
  featured?: boolean;
};

export async function createProduct(input: ProductInput) {
  return prisma.product.create({ data: input });
}

export async function updateProduct(id: string, input: ProductInput) {
  return prisma.product.update({ where: { id }, data: input });
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

export async function createOrder(input: CreateOrderInput) {
  const subtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shipping = input.items.length > 0 ? 280 : 0;
  const total = subtotal + shipping;

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

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      street: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.zip,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
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
    },
    items: order.items.map((i) => ({
      id: i.id,
      name: i.product.name,
      brand: "",
      sku: i.product.sku,
      quantity: i.quantity,
      price: `$${Number(i.unitPrice.toString()).toLocaleString("es-MX")}`,
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
