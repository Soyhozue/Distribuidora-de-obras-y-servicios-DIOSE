import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia" as const,
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://diose.vercel.app";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
  }

  const body = await request.json();
  const { items, customerName, customerEmail, metadata } = body;

  if (!items?.length || !customerName || !customerEmail) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item: { name: string; price: number; quantity: number; image?: string }) => ({
      price_data: {
        currency: "mxn",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })
  );

  // Add shipping as a line item
  lineItems.push({
    price_data: {
      currency: "mxn",
      product_data: { name: "Envío a domicilio" },
      unit_amount: 28000, // $280 MXN
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: lineItems,
    metadata: {
      customerName,
      ...metadata,
    },
    success_url: `${BASE_URL}/pedido-confirmado?stripe=1`,
    cancel_url: `${BASE_URL}/checkout`,
    locale: "es",
    phone_number_collection: { enabled: true },
    shipping_address_collection: {
      allowed_countries: ["MX"],
    },
  });

  return NextResponse.json({ url: session.url });
}
