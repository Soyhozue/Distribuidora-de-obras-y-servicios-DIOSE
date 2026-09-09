import { NextResponse } from "next/server";
import { verifyUserCredentials } from "@/lib/data";
import { createSession } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { loginSchema, firstIssueMessage } from "@/lib/validation";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`login:${getClientIp(request)}`, 20, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  try {
    const user = await verifyUserCredentials(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 429 });
  }
}
