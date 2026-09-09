import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { isValidMercadoPagoSignature } from "./mercadopagoSignature";

function fakeHeaders(map: Record<string, string>) {
  return { get: (name: string) => map[name] ?? null };
}

function signManifest(secret: string, dataId: string, requestId: string, ts: string) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("isValidMercadoPagoSignature", () => {
  const secret = "test-webhook-secret";
  const dataId = "123456789";
  const requestId = "req-abc-123";
  const ts = "1700000000";

  it("accepts a correctly signed notification", () => {
    const v1 = signManifest(secret, dataId, requestId, ts);
    const headers = fakeHeaders({ "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId });
    expect(isValidMercadoPagoSignature(headers, dataId, secret)).toBe(true);
  });

  it("rejects a tampered v1 hash", () => {
    const headers = fakeHeaders({ "x-signature": `ts=${ts},v1=${"0".repeat(64)}`, "x-request-id": requestId });
    expect(isValidMercadoPagoSignature(headers, dataId, secret)).toBe(false);
  });

  it("rejects when the data id doesn't match what was signed (id tampering)", () => {
    const v1 = signManifest(secret, dataId, requestId, ts);
    const headers = fakeHeaders({ "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId });
    expect(isValidMercadoPagoSignature(headers, "999999999", secret)).toBe(false);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const v1 = signManifest("someone-elses-secret", dataId, requestId, ts);
    const headers = fakeHeaders({ "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId });
    expect(isValidMercadoPagoSignature(headers, dataId, secret)).toBe(false);
  });

  it("rejects when x-request-id is missing", () => {
    const v1 = signManifest(secret, dataId, requestId, ts);
    const headers = fakeHeaders({ "x-signature": `ts=${ts},v1=${v1}` });
    expect(isValidMercadoPagoSignature(headers, dataId, secret)).toBe(false);
  });

  it("rejects when x-signature is missing entirely", () => {
    const headers = fakeHeaders({ "x-request-id": requestId });
    expect(isValidMercadoPagoSignature(headers, dataId, secret)).toBe(false);
  });

  it("rejects a malformed x-signature header (no ts/v1 pairs)", () => {
    const headers = fakeHeaders({ "x-signature": "garbage", "x-request-id": requestId });
    expect(isValidMercadoPagoSignature(headers, dataId, secret)).toBe(false);
  });

  // Backward-compatible fallback: the secret hasn't been configured in this
  // deployment yet, so the check is skipped (the webhook route re-fetches
  // the payment from MP's API before trusting it either way).
  it("passes everything through when no secret is configured", () => {
    const headers = fakeHeaders({});
    expect(isValidMercadoPagoSignature(headers, dataId, undefined)).toBe(true);
  });
});
