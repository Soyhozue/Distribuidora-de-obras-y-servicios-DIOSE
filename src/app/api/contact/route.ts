import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/data";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`contact:${getClientIp(request)}`, 5, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  const message = await createContactMessage(body);
  return NextResponse.json(message);
}
