import { NextResponse } from "next/server";
import { createPromoImage, getPromoImages } from "@/lib/data";
import { getAdminSessionId } from "@/lib/auth";

export async function GET() {
  const promos = await getPromoImages();
  return NextResponse.json(promos);
}

export async function POST(request: Request) {
  const adminId = await getAdminSessionId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const promo = await createPromoImage(body);
  return NextResponse.json(promo);
}
