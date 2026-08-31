import { NextResponse } from "next/server";
import { createProduct } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const product = await createProduct(body);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "No se pudo crear el producto." }, { status: 400 });
  }
}
