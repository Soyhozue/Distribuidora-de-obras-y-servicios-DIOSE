import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { confirmPaidOrder } from "@/lib/data";
import { isValidMercadoPagoSignature } from "@/lib/mercadopagoSignature";
import { reportError } from "@/lib/errorReporting";

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return new NextResponse(null, { status: 200 });

  try {
    const body = (await request.json()) as { type?: string; data?: { id?: string } };

    // Only process payment notifications
    if (body.type !== "payment" || !body.data?.id) {
      return new NextResponse(null, { status: 200 });
    }

    // The id MP actually signs is the one in the notification URL's query
    // string, not the body — they're the same value, but the signature only
    // validates against the query-string one.
    const dataIdFromQuery = new URL(request.url).searchParams.get("data.id") ?? body.data.id;
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) {
      console.error("MERCADOPAGO_WEBHOOK_SECRET no configurado — webhook sin verificar firma.");
    }
    if (!isValidMercadoPagoSignature(request.headers, dataIdFromQuery, secret)) {
      console.error("Webhook de Mercado Pago con firma inválida — ignorado.");
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

    await confirmPaidOrder(orderId);
  } catch (err) {
    // Always return 200 so MP doesn't retry endlessly
    await reportError("Error procesando webhook de Mercado Pago:", err);
  }

  return new NextResponse(null, { status: 200 });
}
