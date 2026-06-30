import { NextResponse } from "next/server";
import { createOrder, type CreateOrderInput } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as CreateOrderInput;

  if (!body.customerEmail || !body.customerName || !body.items?.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Validar stock antes de crear la orden
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

  const order = await createOrder(body);
  return NextResponse.json({ id: order.id, number: order.number });
}
