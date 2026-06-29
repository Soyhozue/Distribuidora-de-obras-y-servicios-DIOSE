import { NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "@/lib/data";
import { getAdminSessionId } from "@/lib/auth";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const adminId = await getAdminSessionId();
  if (!adminId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const settings = await updateSiteSettings(body);
  return NextResponse.json(settings);
}
