import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Aviso de Privacidad | DIOSE",
  description: "Aviso de privacidad y protección de datos personales de DIOSE.",
};

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="font-heading text-4xl text-diose-black tracking-[0.06em] mb-8">Aviso de Privacidad</h1>
        <div className="prose prose-sm text-gray-700 leading-relaxed flex flex-col gap-6">
          <p>En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), DIOSE (Distribuidora de Obras y Servicios Especializados), con domicilio en Ciudad Juárez, Chihuahua, México, pone a tu disposición el siguiente aviso de privacidad.</p>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">Datos que recopilamos</h2>
            <p>Recopilamos los siguientes datos personales cuando realizas una compra o creas una cuenta:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de entrega</li>
              <li>Historial de pedidos</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">Finalidad del tratamiento</h2>
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li>Procesar y entregar tus pedidos</li>
              <li>Enviarte confirmaciones y actualizaciones sobre tus compras</li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>Cumplir con obligaciones legales y fiscales</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">Transferencia de datos</h2>
            <p>Tus datos personales no serán vendidos ni transferidos a terceros sin tu consentimiento, salvo por obligación legal o para el cumplimiento de contratos necesarios para prestarte el servicio (ej. servicios de entrega).</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">Seguridad</h2>
            <p>Implementamos medidas de seguridad técnicas y administrativas para proteger tus datos contra accesos no autorizados, pérdida o alteración. Las contraseñas se almacenan de forma cifrada.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">Derechos ARCO</h2>
            <p>Tienes derecho de Acceso, Rectificación, Cancelación y Oposición al tratamiento de tus datos personales. Para ejercerlos, envía una solicitud a <strong>contacto@diose.mx</strong> con el asunto "Derechos ARCO".</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">Cookies</h2>
            <p>Nuestro sitio utiliza cookies esenciales para el funcionamiento del carrito de compras y la sesión de usuario. No utilizamos cookies de seguimiento de terceros.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">Cambios al aviso</h2>
            <p>Podemos actualizar este aviso de privacidad en cualquier momento. Cualquier cambio será publicado en esta página.</p>
          </section>
          <p className="text-xs text-gray-400 mt-4">Última actualización: junio 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
