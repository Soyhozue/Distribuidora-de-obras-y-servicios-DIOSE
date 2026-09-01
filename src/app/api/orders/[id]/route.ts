import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/data";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const order = await updateOrderStatus(id, body);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "No se pudo actualizar el pedido." }, { status: 400 });
  }
}
