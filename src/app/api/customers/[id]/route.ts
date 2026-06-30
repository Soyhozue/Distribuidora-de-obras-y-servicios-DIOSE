import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionId } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSessionId();
  if (!adminId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  // Delete in dependency order to avoid FK constraint errors
  await prisma.orderItem.deleteMany({ where: { order: { userId: id } } });
  await prisma.order.deleteMany({ where: { userId: id } });
  await prisma.address.deleteMany({ where: { userId: id } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
