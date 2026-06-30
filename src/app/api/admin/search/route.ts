import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const isNum = /^\d+$/.test(q);

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      where: isNum
        ? { number: parseInt(q) }
        : { user: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } },
      include: { user: { select: { name: true } } },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] },
      take: 5,
      orderBy: { name: "asc" },
    }),
  ]);

  const results = [
    ...orders.map((o) => ({
      type: "pedido" as const,
      label: `Pedido #${o.number}`,
      sub: `${o.user.name} · $${Number(o.total).toLocaleString("es-MX")}`,
      href: `/admin/pedidos/${o.id}`,
    })),
    ...products.map((p) => ({
      type: "producto" as const,
      label: p.name,
      sub: `SKU-${p.sku} · $${Number(p.price).toLocaleString("es-MX")}`,
      href: `/admin/productos`,
    })),
  ];

  return NextResponse.json({ results });
}
