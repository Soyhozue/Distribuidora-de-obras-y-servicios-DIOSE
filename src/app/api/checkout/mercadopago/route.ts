import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://diose.vercel.app";

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "MercadoPago no configurado" }, { status: 503 });
  }

  const { customerName, customerEmail, items } = await request.json();

  const preference = {
    items: items.map((i: { name: string; price: number; quantity: number }) => ({
      title: i.name,
      quantity: i.quantity,
      unit_price: i.price,
      currency_id: "MXN",
    })),
    payer: { name: customerName, email: customerEmail },
    back_urls: {
      success: `${BASE_URL}/pedido-confirmado?mp=1`,
      failure: `${BASE_URL}/checkout`,
      pending: `${BASE_URL}/pedido-confirmado?mp=pending`,
    },
    auto_return: "approved",
    statement_descriptor: "DIOSE",
    shipments: {
      cost: 280,
      mode: "not_specified",
    },
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preference),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message ?? "Error en MercadoPago" }, { status: 500 });
  }

  // init_point = producción, sandbox_init_point = pruebas
  const url = process.env.NODE_ENV === "production" ? data.init_point : data.sandbox_init_point;
  return NextResponse.json({ url });
}
