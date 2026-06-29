import { NextResponse } from "next/server";
import { registerUser } from "@/lib/data";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  try {
    const user = await registerUser(body);
    await createSession(user.id);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
