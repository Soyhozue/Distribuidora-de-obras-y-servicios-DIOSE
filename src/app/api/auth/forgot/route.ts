import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { emailSchema } from "@/lib/validation";
import { reportError } from "@/lib/errorReporting";
import crypto from "crypto";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`forgot:${getClientIp(request)}`, 5, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  const parsed = emailSchema.safeParse(body?.email);
  if (!parsed.success) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  // Always return success to avoid user enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });

  await sendPasswordResetEmail(user.email, user.name, token).catch((err) =>
    reportError("No se pudo enviar el correo de recuperación:", err)
  );

  return NextResponse.json({ ok: true });
}
