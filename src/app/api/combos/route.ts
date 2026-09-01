import { NextResponse } from "next/server";
import { createCombo, getCombos } from "@/lib/data";

export async function GET() {
  const combos = await getCombos();
  return NextResponse.json(combos);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title || !Array.isArray(body.productIds) || body.productIds.length === 0) {
    return NextResponse.json({ error: "Selecciona al menos un producto y dale un título." }, { status: 400 });
  }
  try {
    const combo = await createCombo(body);
    return NextResponse.json(combo);
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la publicidad." }, { status: 400 });
  }
}
