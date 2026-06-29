import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  const message = await createContactMessage(body);
  return NextResponse.json(message);
}
