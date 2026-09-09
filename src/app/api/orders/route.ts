import { NextResponse } from "next/server";
import { createOrder } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import { getSessionUserId } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { createOrderSchema, firstIssueMessage } from "@/lib/validation";
import { reportError } from "@/lib/errorReporting";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`orders:${getClientIp(request)}`, 10, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const parsed = createOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const body = parsed.data;

  const productIds = body.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, stock: true, stockStatus: true },
  });

  for (const item of body.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: `Producto no encontrado` }, { status: 400 });
    }
    if (product.stockStatus === "AGOTADO" || product.stock < item.quantity) {
      return NextResponse.json(
        { error: `"${product.name}" no tiene suficiente stock disponible.` },
        { status: 409 }
      );
    }
  }

  const sessionUserId = await getSessionUserId();
  const order = await createOrder(body, sessionUserId ?? undefined);

  // Email de confirmación — fire & forget
  sendOrderConfirmation({
    number: order.number,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    items: order.items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    discount: Number(order.discount),
    total: Number(order.total),
  }).catch((err) => reportError(`No se pudo enviar confirmación de pedido #${order.number}:`, err));

  return NextResponse.json({ id: order.id, number: order.number });
}
