import { Resend } from "resend";

const FROM = "DIOSE <noreply@diose.mx>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "no-key");
}

function formatPrice(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

export async function sendOrderConfirmation(order: {
  number: number;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const itemsHtml = order.items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;text-align:right;">${formatPrice(i.unitPrice * i.quantity)}</td>
    </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `DIOSE – Pedido #${order.number} recibido`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;">
    <div style="background:#0A0A0A;padding:24px 32px;text-align:center;">
      <span style="font-size:22px;font-weight:bold;color:#fff;letter-spacing:6px;">DIOSE</span>
    </div>
    <div style="padding:32px;">
      <h2 style="font-size:18px;font-weight:600;margin:0 0 8px;">¡Gracias, ${order.customerName}!</h2>
      <p style="color:#666;font-size:14px;margin:0 0 24px;">Recibimos tu pedido <strong>#${order.number}</strong>. En breve nos pondremos en contacto contigo.</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="border-bottom:2px solid #0A0A0A;">
            <th style="text-align:left;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Producto</th>
            <th style="text-align:center;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Cant.</th>
            <th style="text-align:right;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      ${order.discount > 0 ? `<p style="text-align:right;font-size:13px;color:#16a34a;margin:4px 0;">Descuento: -${formatPrice(order.discount)}</p>` : ""}
      <p style="text-align:right;font-size:13px;color:#666;margin:4px 0;">Envío: ${order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}</p>
      <p style="text-align:right;font-size:18px;font-weight:700;margin:12px 0 0;border-top:2px solid #0A0A0A;padding-top:12px;">Total: ${formatPrice(order.total)}</p>
    </div>
    <div style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
      DIOSE · Ciudad Juárez, Chihuahua · <a href="https://diose.vercel.app" style="color:#999;">diose.vercel.app</a>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  if (!process.env.RESEND_API_KEY) return;
  const link = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://diose.vercel.app"}/recuperar?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "DIOSE – Recupera tu contraseña",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;">
    <div style="background:#0A0A0A;padding:24px 32px;text-align:center;">
      <span style="font-size:22px;font-weight:bold;color:#fff;letter-spacing:6px;">DIOSE</span>
    </div>
    <div style="padding:32px;">
      <h2 style="font-size:18px;font-weight:600;margin:0 0 8px;">Hola, ${name}</h2>
      <p style="color:#666;font-size:14px;margin:0 0 24px;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón a continuación (válido por 1 hora):</p>
      <a href="${link}" style="display:inline-block;background:#0A0A0A;color:#fff;padding:14px 32px;font-size:13px;font-weight:600;letter-spacing:2px;text-decoration:none;text-transform:uppercase;">Restablecer contraseña</a>
      <p style="color:#aaa;font-size:12px;margin:24px 0 0;">Si no solicitaste esto, ignora este correo.</p>
    </div>
  </div>
</body>
</html>`,
  });
}
