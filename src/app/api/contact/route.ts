import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/data";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { contactSchema, firstIssueMessage } from "@/lib/validation";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`contact:${getClientIp(request)}`, 5, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  const message = await createContactMessage(parsed.data);
  return NextResponse.json(message);
}
