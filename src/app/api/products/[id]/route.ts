import { NextResponse } from "next/server";
import { deleteProduct, updateProduct, updateProductStock } from "@/lib/data";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const product = await updateProduct(id, body);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "No se pudo guardar el producto." }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const product = await updateProductStock(id, Number(body.stock));
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "No se pudo actualizar el stock." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "No se pudo eliminar el producto." }, { status: 409 });
  }
}
