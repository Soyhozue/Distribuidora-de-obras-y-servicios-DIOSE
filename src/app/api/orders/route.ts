import { NextResponse } from "next/server";
import { createOrder, type CreateOrderInput } from "@/lib/data";

export async function POST(request: Request) {
  const body = (await request.json()) as CreateOrderInput;

  if (!body.customerEmail || !body.customerName || !body.items?.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const order = await createOrder(body);
  return NextResponse.json({ id: order.id, number: order.number });
}
