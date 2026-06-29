import { NextResponse } from "next/server";
import { verifyUserCredentials } from "@/lib/data";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  const user = await verifyUserCredentials(body.email, body.password);
  if (!user) {
    return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
