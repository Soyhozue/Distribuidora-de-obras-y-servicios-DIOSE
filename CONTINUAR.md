# DIOSE Web — Guía para continuar en otra PC

## 1. Qué es este proyecto
Sitio web de DIOSE (distribuidora de materiales y herramientas, Ciudad Juárez): catálogo, carrito, checkout, cuenta de cliente y panel administrativo. Hecho con **Next.js + TypeScript + Tailwind CSS + Prisma**, base de datos en **Supabase (Postgres)**, alojado en **Vercel**, código en **GitHub**.

## 2. Cuentas y accesos que ya existen
- **GitHub:** repo `Soyhozue/Distribuidora-de-obras-y-servicios-DIOSE` (rama `main`)
- **Vercel:** proyecto `diose web`, ya conectado al repo de GitHub y al dominio `diosedistribuidora.com.mx`
- **Supabase:** proyecto `diose`, conectado dentro de Vercel (pestaña "Connect" → ORM). Ahí están las variables `DATABASE_URL` y `DIRECT_URL`.
- Las variables de entorno (`DATABASE_URL`, `DIRECT_URL`) ya están guardadas en **Vercel → Settings → Environment Variables**. No están en el código por seguridad.

Para trabajar localmente en otra PC necesitas iniciar sesión con las mismas cuentas (GitHub, Vercel, Supabase) — pídele las credenciales a quien las tenga, o usa las tuyas si ya tienes acceso.

## 3. Cómo levantar el proyecto en una PC nueva

```bash
# 1. Clonar el repositorio
git clone https://github.com/Soyhozue/Distribuidora-de-obras-y-servicios-DIOSE.git
cd Distribuidora-de-obras-y-servicios-DIOSE

# 2. Instalar dependencias
npm install

# 3. Crear un archivo .env en la raíz del proyecto con:
DATABASE_URL="postgresql://postgres.ntpdcyoeulknkezftwvb:TU-CONTRASEÑA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ntpdcyoeulknkezftwvb:TU-CONTRASEÑA@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
# (toma estos valores reales desde Vercel > Settings > Environment Variables,
#  o desde Supabase > Connect > ORM)

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

## 4. Estructura del código (dónde está cada cosa)
- `src/app/page.tsx` — Inicio
- `src/app/catalogo/` — Catálogo (página + filtros)
- `src/app/producto/[id]/` — Detalle de producto
- `src/app/carrito/page.tsx` — Carrito
- `src/app/checkout/page.tsx` — Checkout (crea pedidos reales)
- `src/app/cuenta/page.tsx` — Mi Cuenta (**todavía con datos de ejemplo**, ver pendientes)
- `src/app/nosotros/`, `src/app/contacto/` — páginas institucionales
- `src/app/admin/` — Panel admin (dashboard, productos, pedidos, publicidad)
- `src/app/api/orders/` — API que crea/actualiza/borra pedidos
- `src/lib/data.ts` — todas las consultas a la base de datos (productos, pedidos, categorías, marcas)
- `src/lib/prisma.ts` — conexión a la base de datos
- `prisma/schema.prisma` — estructura de las tablas
- `src/store/cart.ts` — carrito de compras (se guarda en el navegador del cliente)
- `src/components/` — piezas reutilizables (Navbar, Footer, tarjetas de producto, iconos, etc.)
- `public/images/` — logo y foto de fondo del hero

## 5. Qué ya funciona (real, conectado a base de datos)
- Catálogo, inicio y detalle de producto leen productos reales de Supabase.
- El checkout crea pedidos de verdad en la base de datos (cliente, dirección, productos, total).
- El panel admin (Dashboard, Pedidos, Productos) lee y actualiza datos reales.
- El admin puede cambiar el estado de un pedido, agregar notas, y eliminarlo.

## 6. Qué falta (pendientes conocidos)
1. **Pasarela de pago real (Mercado Pago).** Hoy el checkout solo registra el pedido, no cobra. Está pausado porque las llaves (Public Key / Access Token) las tienen los dueños del negocio, no Josué. Cuando las tengan: crear app en `mercadopago.com.mx/developers/panel`, copiar las llaves, y pegarlas en Vercel como variables de entorno (igual que se hizo con Supabase).
2. **Login real de clientes.** "Mi Cuenta" hoy muestra pedidos de ejemplo porque no hay sistema de inicio de sesión — no se sabe "quién" está viendo la página. Falta construir registro/login (probablemente con NextAuth o Supabase Auth) para que cada cliente vea sus propios pedidos reales.
3. **Fotos reales de productos.** Ahora los productos se muestran con iconos genéricos (no fotos). Hay que: (a) agregar función de subir imágenes en el admin, o (b) cargarlas directo en Supabase y conectar el campo `images` de la tabla `Product`.
4. **Creador de Publicidad y Combos** (pantalla `/admin/publicidad`) sigue siendo solo visual, no guarda nada en la base de datos todavía.
5. **Agregar/editar productos desde el admin.** Hoy el botón "+ Añadir producto" no hace nada — los productos solo se pueden agregar escribiendo SQL directo en Supabase.

## 7. Notas importantes
- Nunca subas el archivo `.env` a GitHub (ya está bloqueado por `.gitignore`, pero ten cuidado).
- El SQL para crear las tablas está guardado en `prisma/init.sql` y el de productos de ejemplo en `prisma/seed.sql`, por si hay que recrear la base de datos desde cero algún día.
- Si agregas un campo nuevo a `prisma/schema.prisma`, recuerda correr `npx prisma generate` y aplicar el cambio en la base de datos (con SQL manual en Supabase, o con `npx prisma migrate dev` si tienes `DATABASE_URL`/`DIRECT_URL` configuradas localmente).
