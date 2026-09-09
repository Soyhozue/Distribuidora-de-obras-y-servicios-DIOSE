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

// style-src needs 'unsafe-inline': React/Tailwind set plenty of dynamic
// `style={{...}}` attributes (rulers, progress bars, etc.) and there's no
// practical way to nonce a style *attribute* the way you can a <script> tag.
// script-src instead uses a per-request nonce + 'strict-dynamic', so only
// scripts Next.js itself injects (and marks with that nonce) can run —
// nothing an attacker manages to inject via stored/reflected XSS.
function buildCsp(nonce: string) {
  // React dev mode uses eval() for its debugging tools (stack rewriting,
  // etc.) — never in production builds, so this only loosens script-src
  // locally, not for real visitors.
  const devEval = process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : "";
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://*.public.blob.vercel-storage.com`,
    `media-src 'self' https://*.public.blob.vercel-storage.com`,
    `font-src 'self' data:`,
    `connect-src 'self'`,
    `frame-src 'self' https://www.google.com https://maps.google.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const valid = await isValidAdminSession(request);

  // Proteger rutas del panel admin
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Rutas bajo /api/admin (salvo login/logout) requieren sesión de admin
  // para CUALQUIER método — exponen datos de clientes (CSV, búsqueda), no
  // solo escritura.
  const isAdminOnlyApi =
    pathname.startsWith("/api/admin") && pathname !== "/api/admin/login" && pathname !== "/api/admin/logout";

  if (isAdminOnlyApi && !valid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Proteger APIs de administración (lectura pública, escritura solo admin)
  const isProtectedApi =
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/combos") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/promos") ||
    pathname.startsWith("/api/coupons") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/subcategories") ||
    pathname.startsWith("/api/brands") ||
    /^\/api\/orders\/[^/]+$/.test(pathname);

  if (isProtectedApi && request.method !== "GET" && !valid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Cabeceras de seguridad — se aplican a toda petición que pase por aquí
  // (ver matcher abajo, ampliado para cubrir prácticamente todo el sitio).
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/products/:path*",
    "/api/combos/:path*",
    "/api/orders/:path+",
    "/api/settings/:path*",
    "/api/upload",
    "/api/promos/:path*",
    "/api/coupons/:path*",
    "/api/categories/:path*",
    "/api/subcategories/:path*",
    "/api/brands/:path*",
    // Todo lo demás (páginas públicas, checkout, resto de /api) — para que
    // el CSP con nonce cubra cada página, no solo las rutas de admin.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
