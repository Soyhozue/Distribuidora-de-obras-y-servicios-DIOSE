import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SESSION_COOKIE = "diose_admin_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "fallback-secret-change-me");

async function isValidAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const valid = await isValidAdminSession(request);

  // Proteger rutas del panel admin
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Proteger APIs de administración
  const isProtectedApi =
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/combos") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/promos") ||
    /^\/api\/orders\/[^/]+$/.test(pathname);

  if (isProtectedApi && request.method !== "GET" && !valid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products/:path*",
    "/api/combos/:path*",
    "/api/orders/:path+",
    "/api/settings/:path*",
    "/api/upload",
    "/api/promos/:path*",
  ],
};
