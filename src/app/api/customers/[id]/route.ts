import { NextResponse } from "next/server";
import { getAdminSessionId } from "@/lib/auth";
import { deleteCustomer } from "@/lib/data";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSessionId();
  if (!adminId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    await deleteCustomer(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "No se pudo eliminar el cliente." }, { status: 409 });
  }
}
