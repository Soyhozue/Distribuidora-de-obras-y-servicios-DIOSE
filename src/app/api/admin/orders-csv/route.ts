import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: string[] = [
    ["#", "Fecha", "Cliente", "Email", "Teléfono", "Dirección", "Ciudad", "Estado", "CP", "Productos", "Subtotal", "Envío", "Total", "Estatus", "Pago"].join(","),
  ];

  for (const o of orders) {
    const productos = o.items.map((i) => `${i.product.name} x${i.quantity}`).join(" | ");
    const addr = o.address;
    rows.push(
      [
        o.number,
        o.createdAt.toLocaleDateString("es-MX"),
        `"${o.user.name}"`,
        o.user.email,
        o.user.phone ?? "",
        addr ? `"${addr.street}"` : "",
        addr?.city ?? "",
        addr?.state ?? "",
        addr?.postalCode ?? "",
        `"${productos}"`,
        Number(o.subtotal).toFixed(2),
        Number(o.shipping).toFixed(2),
        Number(o.total).toFixed(2),
        o.status,
        o.paymentMethod,
      ].join(",")
    );
  }

  const csv = rows.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
