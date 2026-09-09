import { describe, it, expect } from "vitest";
import { contactSchema, registerSchema, loginSchema, createOrderSchema } from "./validation";

describe("contactSchema", () => {
  it("accepts a well-formed message", () => {
    const result = contactSchema.safeParse({
      name: "Ana López",
      email: "ana@example.com",
      message: "Quisiera información sobre tornillos hexagonales.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ name: "Ana", email: "no-es-email", message: "Hola, tengo una duda." });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = contactSchema.safeParse({ name: "Ana", email: "ana@example.com", message: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects a name that's just whitespace", () => {
    const result = contactSchema.safeParse({ name: "   ", email: "ana@example.com", message: "Hola, tengo una duda." });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects a password under 8 characters", () => {
    const result = registerSchema.safeParse({ name: "Juan Pérez", email: "juan@example.com", password: "abc123" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "unaContraseñaSegura123",
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "juan@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("createOrderSchema", () => {
  const base = {
    customerName: "Juan Pérez",
    customerEmail: "juan@example.com",
    customerPhone: "6561234567",
    address: "Calle Falsa 123",
    city: "Ciudad Juárez",
    state: "Chihuahua",
    zip: "32000",
    paymentMethod: "EFECTIVO" as const,
    items: [{ productId: "abc123", quantity: 2, unitPrice: 100 }],
  };

  it("accepts a well-formed order", () => {
    expect(createOrderSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid postal code", () => {
    expect(createOrderSchema.safeParse({ ...base, zip: "ABCDE" }).success).toBe(false);
  });

  it("rejects an empty cart", () => {
    expect(createOrderSchema.safeParse({ ...base, items: [] }).success).toBe(false);
  });

  it("rejects a payment method outside the allowed set", () => {
    expect(createOrderSchema.safeParse({ ...base, paymentMethod: "BITCOIN" }).success).toBe(false);
  });

  it("rejects a non-positive item quantity", () => {
    const badItems = [{ productId: "abc123", quantity: 0, unitPrice: 100 }];
    expect(createOrderSchema.safeParse({ ...base, items: badItems }).success).toBe(false);
  });

  it("rejects an invoice with a malformed RFC", () => {
    const result = createOrderSchema.safeParse({
      ...base,
      invoice: { rfc: "NOT-AN-RFC", name: "Empresa SA de CV", zip: "32000", regime: "601", cfdiUse: "G03" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts an invoice with a valid RFC", () => {
    const result = createOrderSchema.safeParse({
      ...base,
      invoice: { rfc: "XAXX010101000", name: "Empresa SA de CV", zip: "32000", regime: "601", cfdiUse: "G03" },
    });
    expect(result.success).toBe(true);
  });
});
