import { NextResponse } from "next/server";
import { deletePromoImage } from "@/lib/data";
import { getAdminSessionId } from "@/lib/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSessionId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await deletePromoImage(id);
  return NextResponse.json({ ok: true });
}
