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
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
  }
  const MAX_SIZE = 8 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 8 MB" }, { status: 400 });
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
