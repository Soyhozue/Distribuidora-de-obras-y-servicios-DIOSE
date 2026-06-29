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
- `src/app/page.tsx` — Inicio (hero carrusel + tira de categorías + destacados + promos). Las secciones de categorías y destacados **se ocultan solas** cuando no hay productos en la BD.
- `src/app/catalogo/` — Catálogo (filtros, orden, paginación)
- `src/app/producto/[id]/` — Detalle de producto (galería de fotos reales)
- `src/app/carrito/`, `src/app/checkout/` — Carrito (con cupones) y checkout (pedidos reales)
- `src/app/cuenta/` — Mi Cuenta: login/registro real de clientes + pedidos reales + perfil/direcciones
- `src/app/contacto/` — Formulario de contacto (guarda mensajes en BD) + mapa de Google que apunta a la ubicación real del negocio (configurable desde admin)
- `src/app/admin/` — Panel admin completo:
  - `admin/` (dashboard), `admin/pedidos/`, `admin/productos/` (CRUD + fotos), `admin/inventario/` (ajuste rápido de stock), `admin/clientes/` (lista real), `admin/publicidad/` (generador de publicidad rediseñado), `admin/configuracion/` (contacto, mapa, banner full-customizable, logo de socio, promos), `admin/login/`
- `src/app/api/` — todas las rutas de API (auth, admin, products, orders, combos, promos, settings, upload, contact)
- `src/lib/data.ts` — todas las consultas a la base de datos + tipos `HeroSlide`/`HeroGradient`, `parseHeroSlides()`, `getCategoriesWithCounts()`
- `src/lib/auth.ts` — sesiones de cliente y de admin (cookies firmadas con `jose`)
- `src/lib/prisma.ts` — conexión a la base de datos (usa `DATABASE_URL`)
- `src/proxy.ts` — middleware que protege `/admin/*` y las rutas de API que modifican datos
- `prisma/schema.prisma` — estructura de las tablas
- `src/store/cart.ts` — carrito de compras (localStorage del cliente)
- `src/components/` — piezas reutilizables:
  - `Navbar.tsx` — sólo enlaza Catálogo / Nosotros / Contacto (se quitaron los enlaces demo "Herramientas"/"Materiales")
  - `CartBadge.tsx` — globo del carrito con el conteo **real** (se quitó el "3" falso del demo; no muestra nada si el carrito está vacío)
  - `HeroCarousel.tsx` + `HeroSlideLayer.tsx` — banner: cada imagen tiene foco (X/Y), zoom, opacidad y tipo de degradado propios
  - `HeroTitle.tsx` — título del banner con palabra resaltada (color configurable) y sombra fuerte para que **siempre** se lea sobre cualquier fondo
  - `Footer.tsx`, `PromoSection.tsx`, etc.

## 6. Qué ya funciona (real, conectado a base de datos)
- Catálogo, inicio, producto y carrito: 100% conectados a Supabase, con fotos reales subidas vía Vercel Blob.
- Checkout crea pedidos reales.
- Login/registro de clientes real (contraseña encriptada, sesión por cookie). "Mi Cuenta" muestra pedidos reales del cliente.
- Panel admin protegido con login propio (`Admin` model, separado de clientes).
- Admin → Productos: CRUD completo + hasta 6 fotos por producto.
- Admin → Inventario: ajuste rápido de stock.
- Admin → Clientes: lista real de clientes y gasto total.
- Formulario de contacto guarda mensajes reales en la tabla `ContactMessage`.
- **Carrito real:** el globo del carrito muestra el conteo verdadero (se eliminó el "3" falso del demo).
- **Mapa de Contacto:** la página de Contacto muestra la ubicación real del negocio. Se configura desde Admin → Configuración pegando la dirección y/o el código `<iframe>` o el enlace de Google Maps; el parser saca las coordenadas (`!2d`/`!3d` o `@lat,lng`) y arma el mapa y el botón "Ver en Google Maps".

### Admin → Configuración (full-customizable)
- **Contacto:** teléfono, **segundo teléfono (`phone2`)**, WhatsApp, correo, dirección — se reflejan en todo el sitio.
- **Mapa:** campo `mapsUrl` (acepta iframe pegado o enlace de Google Maps).
- **Banner principal (hero) totalmente personalizable:**
  - Varias imágenes; cada una con **foco (X/Y), zoom, opacidad del oscurecimiento y tipo de degradado** (`left` / `flat` / `top` / `bottom`).
  - **Texto del banner editable:** un solo campo de título (los saltos de línea `\n` se respetan), una palabra/frase a **resaltar** con **color elegible** (color picker), subtítulo y eyebrow.
  - **Preview en vivo** que se ve **idéntico** al banner real (mismo `aspect-ratio`: `3/4` en móvil, `29/10` en desktop) — usa los mismos componentes `HeroSlideLayer` + `HeroTitle`.
  - El título **siempre se lee** sobre cualquier fondo gracias a una sombra fuerte (`text-shadow`).
  - Botones CTA agrupados (Botón 1 / Botón 2) con su etiqueta y enlace.
- **Logo de socio/aliado:** se sube una vez (`partnerLogoUrl` + `partnerName`) y se puede activar/desactivar por publicación en el generador de publicidad.
- **Promociones/ofertas** del inicio (`PromoImage`).

### Admin → Publicidad (generador rediseñado)
- Genera **publicaciones individuales** (una foto de producto) **y combos** (collage 2×2 de hasta 4 productos).
- La **foto del producto** sale de la que subes en Admin → Productos (o puedes subir una imagen personalizada).
- Plantilla estilo cartel: foto a sangre completa de fondo, degradado, logo DIOSE arriba + logo del socio opcional, banda de **"PRECIO ESPECIAL"** con precio grande, y barra inferior con **dos teléfonos** + badge de ubicación.
- **Formatos** funcionales que redimensionan el lienzo: cuadrado 1080×1080, story 9/16 1080×1920, banner 1200×628.
- **Colores de fondo** (Negro / Azul oscuro / Rojo oscuro / Blanco) que sólo aplican cuando no hay foto.
- Descarga PNG real (html2canvas-pro), guarda combos en BD (`Combo`/`ComboItem`) y botón para compartir por WhatsApp.

## 7. Qué falta (pendiente conocido)
1. **Pasarela de pago real (Mercado Pago).** El checkout solo registra el pedido, no cobra. Pausado porque las llaves las tienen los dueños del negocio. Cuando las tengan: crear app en `mercadopago.com.mx/developers/panel`, copiar las llaves, pegarlas en Vercel como variables de entorno.
2. Sin más pendientes mayores conocidos — todo lo demás (login, panel admin, imágenes, banner, contacto) ya quedó funcional.

## 8. Notas importantes
- Nunca subas el archivo `.env` a GitHub (bloqueado por `.gitignore`).
- Si agregas un campo nuevo a `prisma/schema.prisma`: corre `npx prisma db push` (usa `DIRECT_URL` automáticamente vía `prisma.config.ts`) y luego `npx prisma generate`.
- Modelos nuevos añadidos en esta fase: `Admin`, `SiteSettings` (fila única `id="main"`), `PromoImage`, `ContactMessage`.
- El campo `images` en `Product` es un array de URLs de Vercel Blob — siempre tiene `@default([])`, nunca es obligatorio al crear.
- **`SiteSettings` (campos del hero/banner y socio):** `heroSlides` (Json: arreglo de `{url, focusX, focusY, zoom, overlay, gradient}`), `heroEyebrow`, `heroTitle` (con `\n`), `heroTitleHighlight`, `heroTitleHighlightColor`, `heroSubtitle`, `heroCta1Label/Link`, `heroCta2Label/Link`, `phone2`, `mapsUrl`, `partnerLogoUrl`, `partnerName`. (Se eliminaron los viejos `heroImages` y `heroTitleLine1/2/3`.)
- **Cuidado al migrar `SiteSettings` en producción:** cambiar columnas con `db push` mientras la versión anterior aún corre puede tirar la página unos segundos ("column does not exist"); se recupera solo cuando Vercel termina de desplegar el código nuevo. Idealmente despliega el código nuevo y luego haz el `db push`.
- **Antes de cada commit** corre `npx tsc --noEmit` y `npm run build` para asegurar que compila.

## 9. Estado de la base de datos (al 2026-06-29)
- **0 productos** cargados todavía — por eso las secciones de "destacados" y la tira de categorías en el inicio están ocultas (se muestran solas cuando el dueño cargue productos). No se borró nada; es comportamiento intencional.
- Existen **categorías** y **marcas** del seed demo (Herramientas, Materiales, Electricidad, Plomería, Pintura, Seguridad; marcas DEWALT, MILWAUKEE, TRUPER, HOLCIM, COMEX, STANLEY, CONDUMEX, FLUKE, SURTEK, BVP, DEACERO). La estructura real de categorías se definirá cuando se carguen productos.
- `SiteSettings` ya tiene datos reales del negocio (teléfonos, WhatsApp, correo, dirección, 3 imágenes reales de banner, título y resaltado).
