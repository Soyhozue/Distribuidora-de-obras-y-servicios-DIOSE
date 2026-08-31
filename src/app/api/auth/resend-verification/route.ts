import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { createEmailVerification } from "@/lib/data";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.emailVerified) return NextResponse.json({ ok: true });

  const token = await createEmailVerification(user.id);
  await sendVerificationEmail(user.email, user.name, token).catch(() => {});

  return NextResponse.json({ ok: true });
}
