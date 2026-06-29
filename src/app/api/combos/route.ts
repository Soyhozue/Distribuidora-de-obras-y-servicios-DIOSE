import { NextResponse } from "next/server";
import { createCombo, getCombos } from "@/lib/data";

export async function GET() {
  const combos = await getCombos();
  return NextResponse.json(combos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const combo = await createCombo(body);
  return NextResponse.json(combo);
}
