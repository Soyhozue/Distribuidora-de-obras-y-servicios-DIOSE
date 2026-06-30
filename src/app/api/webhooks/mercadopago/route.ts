import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return new NextResponse(null, { status: 200 });

  try {
    const body = await request.json() as { type?: string; data?: { id?: string } };

    // Only process payment notifications
    if (body.type !== "payment" || !body.data?.id) {
      return new NextResponse(null, { status: 200 });
    }

    const mp = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mp);
    const payment = await paymentClient.get({ id: Number(body.data.id) });

    if (payment.status !== "approved") {
      return new NextResponse(null, { status: 200 });
    }

    const orderId = payment.external_reference;
    if (!orderId) return new NextResponse(null, { status: 200 });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMADO" },
    });
  } catch {
    // Always return 200 so MP doesn't retry endlessly
  }

  return new NextResponse(null, { status: 200 });
}
