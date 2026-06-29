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
  category: { name: string };
  brand: { name: string };
  featured: boolean;
};

function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    brand: p.brand.name,
    category: p.category.name,
    price: Number(p.price.toString()),
    unit: p.unit ?? undefined,
    stock: p.stock,
    stockStatus: p.stockStatus as Product["stockStatus"],
    icon: pickIcon(p.category.name),
    description: p.description ?? undefined,
    featured: p.featured,
  };
}

export async function getAllProducts(): Promise<Product[]> {
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
