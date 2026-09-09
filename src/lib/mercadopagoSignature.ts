import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies Mercado Pago's x-signature header per their documented scheme:
 * https://www.mercadopago.com.mx/developers/en/docs/your-integrations/notifications/webhooks#editor_5
 * manifest = "id:{data.id};request-id:{x-request-id};ts:{ts};", HMAC-SHA256
 * with the account's webhook secret (separate from the access token — set
 * in the MP dashboard under Webhooks). Without this, anyone who guesses an
 * order id could POST a fake "payment approved" notification and get an
 * unpaid order marked CONFIRMADO (stock decremented, customer notified).
 */
export function isValidMercadoPagoSignature(
  headers: { get(name: string): string | null },
  dataId: string,
  secret: string | undefined
): boolean {
  // Not configured yet — the caller falls back to re-fetching the payment
  // from MP's API before trusting it, which still blocks a fully-fabricated
  // notification (the attacker would need a real payment id), just not as
  // strictly as a signature check.
  if (!secret) return true;

  const signatureHeader = headers.get("x-signature");
  const requestId = headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
