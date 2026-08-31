import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/data";

export async function POST(request: Request) {
  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  const ok = await verifyEmailToken(token);
  if (!ok) {
    return NextResponse.json({ error: "El enlace ha expirado o ya fue usado" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
