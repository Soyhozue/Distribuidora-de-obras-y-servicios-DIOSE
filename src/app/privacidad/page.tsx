import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalNav from "@/components/legal/LegalNav";
import LegalToc from "@/components/legal/LegalToc";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 0;

export const metadata = {
  title: "Aviso de Privacidad",
  description: "Aviso de privacidad y protección de datos personales de DIOSE.",
};

const SECTIONS = [
  { id: "responsable", label: "Responsable del tratamiento" },
  { id: "datos", label: "Datos que recabamos" },
  { id: "menores", label: "Menores de edad" },
  { id: "finalidades", label: "Para qué usamos tus datos" },
  { id: "cookies", label: "Cookies y almacenamiento local" },
  { id: "terceros", label: "Con quién compartimos tus datos" },
  { id: "seguridad", label: "Cómo protegemos tus datos" },
  { id: "arco", label: "Derechos ARCO" },
  { id: "revocacion", label: "Revocar tu consentimiento" },
  { id: "cambios", label: "Cambios a este aviso" },
  { id: "autoridad", label: "Autoridad y quejas" },
  { id: "contacto", label: "Contacto" },
];

export default async function PrivacidadPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="font-heading text-4xl text-diose-black tracking-[0.06em] mb-4">Aviso de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-6">
          Cómo recabamos, usamos y protegemos tus datos personales cuando usas este sitio.
        </p>
        <LegalNav current="privacidad" />

        <div className="prose prose-sm text-gray-700 leading-relaxed flex flex-col gap-8">
          <LegalToc items={SECTIONS} />

          <p>
            En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, DIOSE
            (Distribuidora de Obras y Servicios Especializados) pone a tu disposición el siguiente aviso de privacidad.
          </p>

          <section id="responsable">
            <h2 className="font-semibold text-diose-black mb-2">1. Responsable del tratamiento</h2>
            <p>DIOSE es responsable del tratamiento de tus datos personales recabados a través de este sitio.</p>
            <dl className="flex flex-col gap-1 text-[13px] mt-1">
              <div><dt className="inline font-medium text-diose-black">Domicilio: </dt><dd className="inline">{settings.address}</dd></div>
              <div><dt className="inline font-medium text-diose-black">Correo: </dt><dd className="inline">{settings.email}</dd></div>
              <div><dt className="inline font-medium text-diose-black">Teléfono: </dt><dd className="inline">{settings.phone}</dd></div>
            </dl>
          </section>

          <section id="datos">
            <h2 className="font-semibold text-diose-black mb-2">2. Datos que recabamos</h2>
            <p>Recabamos datos personales cuando creas una cuenta, haces un pedido (incluso como invitado) o nos escribes por el formulario de contacto:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li>Datos de identificación y contacto: nombre, correo electrónico, teléfono.</li>
              <li>Dirección de entrega: calle, ciudad, estado, código postal.</li>
              <li>Historial y detalle de tus pedidos (productos, montos, método de pago elegido).</li>
              <li>Contraseña de tu cuenta, almacenada siempre cifrada — nunca en texto plano.</li>
              <li>Mensajes que nos envíes por el formulario de contacto.</li>
            </ul>
            <p>
              <strong>No recabamos ni almacenamos los datos de tu tarjeta de crédito o débito.</strong> Cuando pagas con
              tarjeta, la captura y el procesamiento del pago ocurren directamente en la plataforma de Mercado Pago,
              conforme a su propio aviso de privacidad.
            </p>
          </section>

          <section id="menores">
            <h2 className="font-semibold text-diose-black mb-2">3. Menores de edad</h2>
            <p>
              Este sitio está dirigido a personas mayores de 18 años y no solicitamos intencionalmente datos de menores
              de edad. Si detectamos o nos notifican que recabamos datos de un menor sin el consentimiento de sus
              padres o tutores, los eliminaremos a la brevedad.
            </p>
          </section>

          <section id="finalidades">
            <h2 className="font-semibold text-diose-black mb-2">4. Para qué usamos tus datos</h2>
            <p>Usamos tus datos personales para las finalidades necesarias para atenderte como cliente:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li>Procesar, confirmar y entregar tus pedidos.</li>
              <li>Crear y administrar tu cuenta, incluida la recuperación de contraseña.</li>
              <li>Calcular envíos y coordinar la entrega con transportistas.</li>
              <li>Enviarte confirmaciones y actualizaciones sobre tus compras.</li>
              <li>Atender dudas, quejas o solicitudes que nos envíes por contacto.</li>
              <li>Cumplir obligaciones legales, fiscales y de facturación.</li>
              <li>Prevenir fraudes y proteger la seguridad de tu cuenta y del sitio.</li>
            </ul>
            <p>
              Actualmente no usamos tus datos con fines de mercadotecnia, publicidad o venta a terceros. Si en el
              futuro ofrecemos boletines o promociones por correo, será mediante un mecanismo opcional que podrás
              activar o cancelar libremente.
            </p>
          </section>

          <section id="cookies">
            <h2 className="font-semibold text-diose-black mb-2">5. Cookies y almacenamiento local</h2>
            <p>Usamos únicamente cookies y almacenamiento local estrictamente necesarios para operar el sitio — no usamos cookies de publicidad, rastreo o analítica de terceros:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li><code>diose_session</code> — mantiene tu sesión iniciada al comprar o consultar tu cuenta (hasta 30 días).</li>
              <li><code>diose_admin_session</code> — sesión del panel administrativo, solo para nuestro equipo (12 horas).</li>
              <li><code>diose-cart</code> — no es una cookie: es almacenamiento local de tu navegador que guarda el contenido de tu carrito de compra entre visitas.</li>
            </ul>
            <p>Puedes borrar estos datos desde la configuración de tu navegador; ten en cuenta que si lo haces, se cerrará tu sesión y se vaciará el carrito.</p>
          </section>

          <section id="terceros">
            <h2 className="font-semibold text-diose-black mb-2">6. Con quién compartimos tus datos</h2>
            <p>
              Tus datos personales no se venden. Los compartimos únicamente con proveedores que nos ayudan a operar el
              sitio y procesan datos por nuestra cuenta, bajo sus propias medidas de seguridad:
            </p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li><strong>Mercado Pago</strong> — procesa los pagos con tarjeta.</li>
              <li><strong>Resend</strong> — envía correos de confirmación de pedido y recuperación de contraseña en nuestro nombre.</li>
              <li><strong>Vercel</strong> — aloja el sitio web y las imágenes de productos.</li>
              <li><strong>Supabase</strong> — aloja la base de datos donde se almacena tu información.</li>
            </ul>
            <p>
              También podemos compartir datos cuando así lo exija una autoridad competente o una obligación legal, o
              para el cumplimiento de un contrato necesario para prestarte el servicio (por ejemplo, con la paquetería
              que entrega tu pedido).
            </p>
          </section>

          <section id="seguridad">
            <h2 className="font-semibold text-diose-black mb-2">7. Cómo protegemos tus datos</h2>
            <p>
              Tu contraseña se almacena cifrada (bcrypt), nunca en texto plano. La comunicación entre tu navegador y
              nuestros servidores viaja cifrada (HTTPS/TLS). El acceso al panel administrativo está protegido y
              limitado a nuestro equipo. Ningún sistema es 100% infalible, pero mantenemos estas medidas actualizadas
              y corregimos vulnerabilidades tan pronto las identificamos.
            </p>
          </section>

          <section id="arco">
            <h2 className="font-semibold text-diose-black mb-2">8. Derechos ARCO</h2>
            <p>
              Tienes derecho a Acceder a tus datos personales, Rectificarlos si son incorrectos, Cancelarlos cuando
              consideres que no se usan conforme a este aviso, y Oponerte a su tratamiento para fines específicos.
            </p>
            <p>
              Para ejercerlos, escribe a <strong>{settings.email}</strong> con el asunto &ldquo;Derechos ARCO&rdquo;, indicando
              claramente qué derecho quieres ejercer, tu nombre completo y una descripción de los datos a los que se
              refiere tu solicitud. Te responderemos en un plazo razonable conforme a la ley aplicable.
            </p>
          </section>

          <section id="revocacion">
            <h2 className="font-semibold text-diose-black mb-2">9. Revocar tu consentimiento</h2>
            <p>
              Puedes revocar el consentimiento que nos diste para el tratamiento de tus datos, o limitar su uso,
              escribiendo a <strong>{settings.email}</strong>. Ten en cuenta que revocarlo puede implicar que ya no
              podamos darte seguimiento a pedidos en curso o mantener tu cuenta activa.
            </p>
          </section>

          <section id="cambios">
            <h2 className="font-semibold text-diose-black mb-2">10. Cambios a este aviso</h2>
            <p>
              Podemos actualizar este aviso de privacidad para reflejar cambios en el sitio o en la legislación
              aplicable. Cualquier cambio se publicará en esta misma página con su fecha de actualización.
            </p>
          </section>

          <section id="autoridad">
            <h2 className="font-semibold text-diose-black mb-2">11. Autoridad y quejas</h2>
            <p>
              Si consideras que tus derechos en materia de protección de datos personales no han sido atendidos, puedes
              acudir a la Secretaría Anticorrupción y Buen Gobierno, autoridad encargada de vigilar el cumplimiento de
              la Ley Federal de Protección de Datos Personales en Posesión de los Particulares tras la desaparición del
              INAI.
            </p>
          </section>

          <section id="contacto">
            <h2 className="font-semibold text-diose-black mb-2">12. Contacto</h2>
            <p>
              Para cualquier duda sobre este aviso o el manejo de tus datos, escríbenos a <strong>{settings.email}</strong>{" "}
              o visita nuestra <a href="/contacto" className="underline">página de contacto</a>.
            </p>
          </section>

          <p className="text-xs text-gray-400 mt-4">Última actualización: agosto 2026.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
