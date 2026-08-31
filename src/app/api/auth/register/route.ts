import { NextResponse } from "next/server";
import { registerUser, createEmailVerification } from "@/lib/data";
import { createSession } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  try {
    const user = await registerUser(body);
    await createSession(user.id);

    // Best-effort: the account is already created and the session started,
    // so a hiccup sending the verification email shouldn't fail registration.
    createEmailVerification(user.id)
      .then((token) => sendVerificationEmail(user.email, user.name, token))
      .catch(() => {});

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
