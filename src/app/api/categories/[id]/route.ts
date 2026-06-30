import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ include: { _count: { select: { products: true } } }, where: { id } });
  if (!category) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (category._count.products > 0)
    return NextResponse.json({ error: `No se puede eliminar: tiene ${category._count.products} producto(s) asignados` }, { status: 409 });
  await prisma.category.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const category = await prisma.category.update({ where: { id }, data: { name: name.trim() } });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
  }
}
