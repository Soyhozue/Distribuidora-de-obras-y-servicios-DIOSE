import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/data";
import { createAdminSession } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { loginSchema, firstIssueMessage } from "@/lib/validation";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`admin-login:${getClientIp(request)}`, 20, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  try {
    const admin = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
    if (!admin) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
    }
    await createAdminSession(admin.id);
    return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 429 });
  }
}
