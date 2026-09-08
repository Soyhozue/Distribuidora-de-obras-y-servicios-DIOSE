import { prisma } from "@/lib/prisma";

/**
 * Best-effort client IP from Vercel's forwarded headers. Not spoof-proof
 * against a determined attacker rotating IPs, but stops the common case of
 * a single script hammering a public endpoint.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Fixed-window counter shared by public, unauthenticated endpoints that
 * have no per-account lockout of their own (contact form, checkout,
 * registration). Returns true if the request is allowed, false if the
 * caller should be throttled.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || now.getTime() - existing.windowStart.getTime() > windowMs) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return true;
  }

  if (existing.count >= limit) return false;

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." }),
    { status: 429, headers: { "Content-Type": "application/json" } }
  );
}
