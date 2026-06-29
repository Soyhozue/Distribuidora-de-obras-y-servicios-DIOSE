import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/data";
import { createAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  const admin = await verifyAdminCredentials(body.email, body.password);
  if (!admin) {
    return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
  }
  await createAdminSession(admin.id);
  return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email });
}
