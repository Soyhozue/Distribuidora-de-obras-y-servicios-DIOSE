import { z } from "zod";

// Shared building blocks — every public endpoint that takes free-text input
// runs it through one of these instead of a bare "is this truthy?" check,
// so we reject malformed emails, absurdly long strings, wrong-shaped RFCs,
// etc. before they ever reach the database or an email/SMS provider.

export const emailSchema = z.string().trim().toLowerCase().email("Correo electrónico inválido").max(255);

export const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .regex(/^[\d\s()+.-]{7,30}$/, "Teléfono inválido")
  .optional()
  .or(z.literal(""));

export const nameSchema = z.string().trim().min(2, "Muy corto").max(120, "Muy largo");

export const messageSchema = z.string().trim().min(5, "Escribe un mensaje más detallado").max(2000, "Máximo 2000 caracteres");

export const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200);

export const addressLineSchema = z.string().trim().min(5, "Dirección muy corta").max(300);
export const cityStateSchema = z.string().trim().min(2, "Muy corto").max(100);
export const zipSchema = z.string().trim().regex(/^\d{4,10}$/, "Código postal inválido");
export const rfcSchema = z.string().trim().toUpperCase().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, "RFC inválido");

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: messageSchema,
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña").max(200),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive().max(100_000),
  unitPrice: z.coerce.number(), // never trusted for pricing — see createOrder in data.ts
});

export const createOrderSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema.transform((v) => v ?? ""),
  address: addressLineSchema,
  city: cityStateSchema,
  state: cityStateSchema,
  zip: zipSchema,
  paymentMethod: z.enum(["TARJETA", "TRANSFERENCIA", "EFECTIVO", "WHATSAPP"]),
  items: z.array(orderItemSchema).min(1, "El carrito está vacío"),
  couponCode: z.string().trim().max(50).optional(),
  invoice: z
    .object({
      rfc: rfcSchema,
      name: z.string().trim().min(2).max(200),
      zip: zipSchema,
      regime: z.string().trim().min(1).max(20),
      cfdiUse: z.string().trim().min(1).max(20),
    })
    .optional(),
});

/** Formats a ZodError into the single-string shape every route already returns. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Datos inválidos";
}
