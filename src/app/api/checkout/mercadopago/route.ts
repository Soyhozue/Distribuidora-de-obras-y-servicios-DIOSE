import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createOrder, type CreateOrderInput } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://diose.com.mx";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago no configurado" }, { status: 503 });
    }

    const body = (await request.json()) as CreateOrderInput;

    if (!body.customerEmail || !body.customerName || !body.items?.length) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Verify stock before charging
    const productIds = body.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, stockStatus: true },
    });
    for (const item of body.items) {
      const p = dbProducts.find((x) => x.id === item.productId);
      if (!p) return NextResponse.json({ error: "Producto no encontrado" }, { status: 400 });
      if (p.stockStatus === "AGOTADO" || p.stock < item.quantity) {
        return NextResponse.json({ error: `"${p.name}" no tiene suficiente stock.` }, { status: 409 });
      }
    }

    // Create order as PENDIENTE — webhook confirms it after payment
    const sessionUserId = await getSessionUserId();
    const order = await createOrder(
      { ...body, paymentMethod: "TARJETA" },
      sessionUserId ?? undefined,
    );

    // Build Mercado Pago preference via official SDK
    const mp = new MercadoPagoConfig({ accessToken });
    const pref = new Preference(mp);

    const result = await pref.create({
      body: {
        external_reference: order.id,
        payer: {
          name: body.customerName,
          email: body.customerEmail,
          ...(body.customerPhone ? { phone: { number: body.customerPhone } } : {}),
        },
        items: body.items.map((item) => {
          const p = dbProducts.find((x) => x.id === item.productId);
          return {
            id: item.productId,
            title: p?.name ?? "Producto",
            quantity: item.quantity,
            unit_price: Number(item.unitPrice),
            currency_id: "MXN",
          };
        }),
        back_urls: {
          success: `${BASE_URL}/pedido-confirmado?n=${order.number}&mp=ok`,
          failure: `${BASE_URL}/checkout?mp=error`,
          pending: `${BASE_URL}/pedido-confirmado?n=${order.number}&mp=pending`,
        },
        auto_return: "approved",
        notification_url: `${BASE_URL}/api/webhooks/mercadopago`,
        statement_descriptor: "DIOSE",
      },
    });

    const isSandbox = process.env.MERCADOPAGO_SANDBOX === "true";
    const url = isSandbox ? result.sandbox_init_point : result.init_point;

    if (!url) {
      return NextResponse.json({ error: "No se pudo generar el link de pago" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err: unknown) {
    console.error("MercadoPago checkout error:", err);
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: `Error al conectar con Mercado Pago: ${message}` }, { status: 500 });
  }
}
