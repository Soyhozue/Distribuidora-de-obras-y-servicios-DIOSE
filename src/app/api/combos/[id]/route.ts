import { NextResponse } from "next/server";
import { deleteCombo } from "@/lib/data";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteCombo(id);
  return NextResponse.json({ ok: true });
}
