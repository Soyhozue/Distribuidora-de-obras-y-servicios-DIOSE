import { NextResponse } from "next/server";
import { registerUser, createEmailVerification } from "@/lib/data";
import { createSession } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { registerSchema, firstIssueMessage } from "@/lib/validation";
import { reportError } from "@/lib/errorReporting";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`register:${getClientIp(request)}`, 5, 10 * 60_000);
  if (!allowed) return rateLimitResponse();

  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }
  try {
    const user = await registerUser(parsed.data);
    await createSession(user.id);

    // Best-effort: the account is already created and the session started,
    // so a hiccup sending the verification email shouldn't fail registration.
    createEmailVerification(user.id)
      .then((token) => sendVerificationEmail(user.email, user.name, token))
      .catch((err) => reportError("No se pudo enviar el correo de verificación de registro:", err));

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
