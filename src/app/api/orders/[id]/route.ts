import { NextResponse } from "next/server";
import { deleteOrder, updateOrderStatus } from "@/lib/data";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const order = await updateOrderStatus(id, body);
  return NextResponse.json(order);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteOrder(id);
  return NextResponse.json({ ok: true });
}
