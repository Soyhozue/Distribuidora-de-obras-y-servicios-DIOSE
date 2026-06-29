# DIOSE Web — Guía para continuar en otra PC

## 1. Qué es este proyecto
Sitio web de DIOSE (distribuidora de materiales y herramientas, Ciudad Juárez): catálogo, carrito, checkout, cuenta de cliente y panel administrativo. Hecho con **Next.js + TypeScript + Tailwind CSS + Prisma**, base de datos en **Supabase (Postgres)**, alojado en **Vercel**, código en **GitHub**. Imágenes subidas (productos, banner, promos) se guardan en **Vercel Blob Storage**.

## 2. Cuentas y accesos que ya existen
- **GitHub:** repo `Soyhozue/Distribuidora-de-obras-y-servicios-DIOSE` (rama `main`)
- **Vercel:** proyecto `diose web`, conectado al repo de GitHub y al dominio `diosedistribuidora.com.mx`
- **Supabase:** proyecto `diose`, conectado dentro de Vercel. De ahí salen `DATABASE_URL` y `DIRECT_URL`.
- **Vercel Blob Storage:** store llamado `dioseimagenes`, genera la variable `BLOB_READ_WRITE_TOKEN`.
- Todas las variables de entorno ya están guardadas en **Vercel → Settings → Environment Variables**: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`. No están en el código por seguridad.

Para trabajar localmente en otra PC necesitas iniciar sesión con las mismas cuentas (GitHub, Vercel, Supabase) — usa las credenciales de `Soyhozue` o pide acceso.

## 3. Cómo levantar el proyecto en una PC nueva

```bash
# 1. Clonar el repositorio
git clone https://github.com/Soyhozue/Distribuidora-de-obras-y-servicios-DIOSE.git
cd Distribuidora-de-obras-y-servicios-DIOSE

# 2. Instalar dependencias
npm install

# 3. Crear un archivo .env en la raíz del proyecto con (sácalos de Vercel → Settings → Environment Variables):
DATABASE_URL="postgresql://postgres.ntpdcyoeulknkezftwvb:TU-CONTRASEÑA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ntpdcyoeulknkezftwvb:TU-CONTRASEÑA@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
AUTH_SECRET="cualquier-cadena-aleatoria-larga"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# 4. Levantar en modo desarrollo
npm run dev
# abre http://localhost:3000

# 5. Para compilar como si fuera producción (revisa errores antes de subir)
npm run build
```

Cualquier cambio se sube así:
```bash
git add -A
git commit -m "Descripción del cambio"
git push origin main
```
Vercel despliega automáticamente cada vez que se hace push a `main`.

**Importante sobre Prisma + Supabase:** las migraciones (`prisma db push` / `migrate`) deben usar `DIRECT_URL` (puerto 5432), no la URL con pooler (puerto 6543), o falla con error de "prepared statement already exists". Esto ya está configurado en `prisma.config.ts` (`datasource.url: process.env.DIRECT_URL`). El cliente en runtime (`src/lib/prisma.ts`) sigue usando `DATABASE_URL` (pooler) correctamente.

## 4. Cuenta de acceso al panel admin
- **Login del admin** (`/admin/login`): `julio.diose@outlook.com` / `juliodiose2026`
- El panel `/admin` está protegido — sin sesión redirige a `/admin/login`. Sesión dura 12h.

## 5. Estructura del código (dónde está cada cosa)
- `src/app/page.tsx` — Inicio (hero carrusel + destacados + promos)
- `src/app/catalogo/` — Catálogo (filtros, orden, paginación)
- `src/app/producto/[id]/` — Detalle de producto (galería de fotos reales)
- `src/app/carrito/`, `src/app/checkout/` — Carrito (con cupones) y checkout (pedidos reales)
- `src/app/cuenta/` — Mi Cuenta: login/registro real de clientes + pedidos reales + perfil/direcciones
- `src/app/contacto/` — Formulario de contacto (guarda mensajes en BD)
- `src/app/admin/` — Panel admin completo:
  - `admin/` (dashboard), `admin/pedidos/`, `admin/productos/` (CRUD + fotos), `admin/inventario/` (ajuste rápido de stock), `admin/clientes/` (lista real), `admin/publicidad/` (combos guardables + descarga de imagen), `admin/configuracion/` (contacto, banner, promos), `admin/login/`
- `src/app/api/` — todas las rutas de API (auth, admin, products, orders, combos, promos, settings, upload, contact)
- `src/lib/data.ts` — todas las consultas a la base de datos
- `src/lib/auth.ts` — sesiones de cliente y de admin (cookies firmadas con `jose`)
- `src/lib/prisma.ts` — conexión a la base de datos (usa `DATABASE_URL`)
- `src/proxy.ts` — middleware que protege `/admin/*` y las rutas de API que modifican datos
- `prisma/schema.prisma` — estructura de las tablas
- `src/store/cart.ts` — carrito de compras (localStorage del cliente)
- `src/components/` — piezas reutilizables (Navbar, Footer, HeroCarousel, PromoSection, etc.)

## 6. Qué ya funciona (real, conectado a base de datos)
- Catálogo, inicio, producto y carrito: 100% conectados a Supabase, con fotos reales subidas vía Vercel Blob.
- Checkout crea pedidos reales.
- Login/registro de clientes real (contraseña encriptada, sesión por cookie). "Mi Cuenta" muestra pedidos reales del cliente.
- Panel admin protegido con login propio (`Admin` model, separado de clientes).
- Admin → Productos: CRUD completo + hasta 6 fotos por producto.
- Admin → Inventario: ajuste rápido de stock.
- Admin → Clientes: lista real de clientes y gasto total.
- Admin → Publicidad: combos guardables en BD, descarga de imagen real (PNG), historial.
- Admin → Configuración: teléfono, WhatsApp, correo y dirección editables (se reflejan en todo el sitio); banner principal con carrusel de imágenes (rota cada 4s); sección de ofertas/promociones en el inicio.
- Formulario de contacto guarda mensajes reales en la tabla `ContactMessage`.

## 7. Qué falta (pendiente conocido)
1. **Pasarela de pago real (Mercado Pago).** El checkout solo registra el pedido, no cobra. Pausado porque las llaves las tienen los dueños del negocio. Cuando las tengan: crear app en `mercadopago.com.mx/developers/panel`, copiar las llaves, pegarlas en Vercel como variables de entorno.
2. Sin más pendientes mayores conocidos — todo lo demás (login, panel admin, imágenes, banner, contacto) ya quedó funcional.

## 8. Notas importantes
- Nunca subas el archivo `.env` a GitHub (bloqueado por `.gitignore`).
- Si agregas un campo nuevo a `prisma/schema.prisma`: corre `npx prisma db push` (usa `DIRECT_URL` automáticamente vía `prisma.config.ts`) y luego `npx prisma generate`.
- Modelos nuevos añadidos en esta fase: `Admin`, `SiteSettings` (fila única `id="main"`), `PromoImage`, `ContactMessage`.
- El campo `images` en `Product` es un array de URLs de Vercel Blob — siempre tiene `@default([])`, nunca es obligatorio al crear.
