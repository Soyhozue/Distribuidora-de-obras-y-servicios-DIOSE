import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { street, city, state, postalCode, isDefault } = await req.json();
  if (!street || !city || !state || !postalCode)
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { userId, street, city, state, postalCode, isDefault: !!isDefault },
  });
  return NextResponse.json(address, { status: 201 });
}
