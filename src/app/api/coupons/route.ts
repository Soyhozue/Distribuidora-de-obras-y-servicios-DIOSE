import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.toUpperCase();

  if (!code) return NextResponse.json({ error: "Código requerido" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Código no válido o inactivo" }, { status: 404 });
  }

  return NextResponse.json({ code: coupon.code, discount: Number(coupon.discount) });
}

// Admin: listar todos los cupones
export async function POST(request: Request) {
  const { code, discount } = await request.json();
  if (!code || !discount) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  const coupon = await prisma.coupon.upsert({
    where: { code: code.toUpperCase() },
    update: { discount, active: true },
    create: { code: code.toUpperCase(), discount, active: true },
  });
  return NextResponse.json(coupon);
}
