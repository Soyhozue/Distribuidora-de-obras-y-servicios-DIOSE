import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getAdminSessionId } from "@/lib/auth";

export async function POST(request: Request) {
  const adminId = await getAdminSessionId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "El archivo debe ser una imagen o un video" }, { status: 400 });
  }
  const MAX_SIZE = isVideo ? 25 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: isVideo ? "El video no puede pesar más de 25 MB" : "La imagen no puede pesar más de 8 MB" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`diose/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "No se pudo subir la imagen. Intenta de nuevo." }, { status: 500 });
  }
}
