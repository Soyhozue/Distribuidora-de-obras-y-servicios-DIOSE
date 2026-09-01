import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { active } = await request.json();
  try {
    const coupon = await prisma.coupon.update({ where: { id }, data: { active } });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json({ error: "Cupón no encontrado." }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Cupón no encontrado." }, { status: 404 });
  }
}
