import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ include: { _count: { select: { products: true } } }, where: { id } });
  if (!brand) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (brand._count.products > 0)
    return NextResponse.json({ error: `No se puede eliminar: tiene ${brand._count.products} producto(s) asignados` }, { status: 409 });
  await prisma.brand.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const brand = await prisma.brand.update({ where: { id }, data: { name: name.trim().toUpperCase(), slug: toSlug(name) } });
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 });
  }
}
