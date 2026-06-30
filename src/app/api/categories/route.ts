import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories.map((c) => ({ id: c.id, name: c.name, count: c._count.products })));
}

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const category = await prisma.category.create({ data: { name: name.trim(), slug: toSlug(name) } });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
  }
}
