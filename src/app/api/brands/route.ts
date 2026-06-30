import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(brands.map((b) => ({ id: b.id, name: b.name, count: b._count.products })));
}

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const brand = await prisma.brand.create({ data: { name: name.trim().toUpperCase(), slug: toSlug(name) } });
    return NextResponse.json(brand, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 });
  }
}
