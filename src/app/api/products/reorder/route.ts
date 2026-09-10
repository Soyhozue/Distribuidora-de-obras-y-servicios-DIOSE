import { NextResponse } from "next/server";
import { reorderProducts } from "@/lib/data";
import { z } from "zod";

const reorderSchema = z.object({
  rows: z
    .array(z.object({ kind: z.enum(["single", "family"]), id: z.string().min(1) }))
    .min(1),
});

export async function POST(request: Request) {
  const parsed = reorderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  await reorderProducts(parsed.data.rows);
  return NextResponse.json({ ok: true });
}
