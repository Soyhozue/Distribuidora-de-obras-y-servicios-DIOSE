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
  if (!body.imageUrl) {
    return NextResponse.json({ error: "Falta la imagen o video de la promoción." }, { status: 400 });
  }
  try {
    const promo = await createPromoImage({
      imageUrl: body.imageUrl,
      mediaType: body.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
      title: body.title || undefined,
      subtitle: body.subtitle || undefined,
      badgeText: body.badgeText || undefined,
      sectionLabel: body.sectionLabel || undefined,
      link: body.link || undefined,
    });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la promoción." }, { status: 400 });
  }
}
