import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = await checkRateLimit(`comprobante:${getClientIp(request)}`, 10, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, number: true, paymentMethod: true, status: true },
  });
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  if (order.paymentMethod !== "TRANSFERENCIA") {
    return NextResponse.json({ error: "Este pedido no admite comprobante de transferencia" }, { status: 400 });
  }
  if (order.status !== "PENDIENTE") {
    return NextResponse.json({ error: "Este pedido ya no está pendiente de pago" }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El comprobante debe ser una imagen" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 8 MB" }, { status: 400 });
  }

  try {
    const blob = await put(`diose/comprobantes/${order.number}-${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { comprobanteUrl: blob.url, comprobanteAt: new Date() },
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch {
    return NextResponse.json({ error: "No se pudo subir el comprobante. Intenta de nuevo." }, { status: 500 });
  }
}
