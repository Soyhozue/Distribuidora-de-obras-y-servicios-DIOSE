import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, password } = await request.json();
  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "El enlace ha expirado o ya fue usado" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await Promise.all([
    prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
