import { NextResponse } from "next/server";
import { deleteCombo } from "@/lib/data";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteCombo(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 400 });
  }
}
