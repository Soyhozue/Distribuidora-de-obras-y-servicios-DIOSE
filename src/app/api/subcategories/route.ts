import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const subcategories = await prisma.subcategory.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(
    subcategories.map((s) => ({ id: s.id, name: s.name, categoryId: s.categoryId, count: s._count.products }))
  );
}

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function POST(req: Request) {
  const { name, categoryId } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: "Selecciona una categoría" }, { status: 400 });
  try {
    const subcategory = await prisma.subcategory.create({
      data: { name: name.trim(), slug: toSlug(name), categoryId },
    });
    return NextResponse.json(subcategory, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe una subcategoría con ese nombre en esta categoría" }, { status: 409 });
  }
}
