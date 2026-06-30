import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  await prisma.address.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await prisma.address.update({ where: { id }, data: { isDefault: true } });
  return NextResponse.json({ ok: true });
}
