import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalNav from "@/components/legal/LegalNav";
import LegalToc from "@/components/legal/LegalToc";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 0;

export const metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de compra y uso del sitio web de DIOSE.",
};

const SECTIONS = [
  { id: "identidad", label: "Quiénes somos" },
  { id: "aceptacion", label: "Aceptación de los términos" },
  { id: "capacidad", label: "Capacidad para contratar" },
  { id: "cuenta", label: "Tu cuenta" },
  { id: "productos-precios", label: "Productos, precios y disponibilidad" },
  { id: "promociones", label: "Cupones y promociones" },
  { id: "compra", label: "Proceso de compra" },
  { id: "pago", label: "Métodos de pago" },
  { id: "facturacion", label: "Facturación" },
  { id: "envios", label: "Envíos y entregas" },
  { id: "cancelaciones", label: "Cancelaciones" },
  { id: "devoluciones", label: "Devoluciones y garantías" },
  { id: "uso-seguro", label: "Uso seguro de los productos" },
  { id: "uso-del-sitio", label: "Uso permitido del sitio" },
  { id: "propiedad-intelectual", label: "Propiedad intelectual" },
  { id: "responsabilidad", label: "Limitación de responsabilidad" },
  { id: "fuerza-mayor", label: "Caso fortuito o fuerza mayor" },
  { id: "modificaciones", label: "Modificaciones" },
  { id: "jurisdiccion", label: "Legislación aplicable" },
  { id: "quejas", label: "Quejas y PROFECO" },
  { id: "contacto", label: "Contacto" },
];

export default async function TerminosPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="font-heading text-4xl text-diose-black tracking-[0.06em] mb-4">Términos y Condiciones</h1>
        <p className="text-sm text-gray-500 mb-6">
          Estas son las condiciones bajo las que puedes usar este sitio y comprar en él. Te pedimos leerlas antes de hacer un pedido.
        </p>
        <LegalNav current="terminos" />

        <div className="prose prose-sm text-gray-700 leading-relaxed flex flex-col gap-8">
          <LegalToc items={SECTIONS} />

          <section id="identidad">
            <h2 className="font-semibold text-diose-black mb-2">1. Quiénes somos</h2>
            <p>Este sitio es operado por <strong>DIOSE</strong> (Distribuidora de Obras y Servicios Especializados).</p>
            <dl className="flex flex-col gap-1 text-[13px] mt-1">
              <div><dt className="inline font-medium text-diose-black">Titular: </dt><dd className="inline">Marine Gabriela Torres Muñiz</dd></div>
              <div><dt className="inline font-medium text-diose-black">RFC: </dt><dd className="inline">TOMM770929764</dd></div>
              <div><dt className="inline font-medium text-diose-black">Régimen fiscal: </dt><dd className="inline">612 – Personas Físicas con Actividades Empresariales y Profesionales</dd></div>
              <div><dt className="inline font-medium text-diose-black">Domicilio: </dt><dd className="inline">{settings.address}</dd></div>
              <div><dt className="inline font-medium text-diose-black">Correo: </dt><dd className="inline">{settings.email}</dd></div>
              <div><dt className="inline font-medium text-diose-black">Teléfono: </dt><dd className="inline">{settings.phone}</dd></div>
            </dl>
          </section>

          <section id="aceptacion">
            <h2 className="font-semibold text-diose-black mb-2">2. Aceptación de los términos</h2>
            <p>
              Al navegar, crear una cuenta o realizar un pedido en este sitio, aceptas estos Términos y Condiciones y nuestro{" "}
              <a href="/privacidad" className="underline">Aviso de Privacidad</a>. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio ni comprar a través de él.
            </p>
          </section>

          <section id="capacidad">
            <h2 className="font-semibold text-diose-black mb-2">3. Capacidad para contratar</h2>
            <p>
              Este sitio está dirigido a personas mayores de 18 años con capacidad legal para contratar. Si realizas una compra a nombre de una empresa, declaras contar con facultades suficientes para representarla.
            </p>
          </section>

          <section id="cuenta">
            <h2 className="font-semibold text-diose-black mb-2">4. Tu cuenta</h2>
            <p>
              Puedes comprar creando una cuenta o como invitado. Eres responsable de mantener tu contraseña en secreto y de toda actividad que ocurra bajo tu cuenta; avísanos de inmediato si detectas un uso no autorizado. Los datos que nos das (nombre, correo, teléfono, dirección) deben ser reales y estar actualizados.
            </p>
            <p>
              Si compras como invitado usando un correo que ya tiene una cuenta registrada, tu pedido se asocia a esa cuenta sin modificar los datos que ya tenías guardados. Podemos suspender o cancelar cuentas usadas para fines fraudulentos o contrarios a estos términos.
            </p>
          </section>

          <section id="productos-precios">
            <h2 className="font-semibold text-diose-black mb-2">5. Productos, precios y disponibilidad</h2>
            <p>
              Los precios se muestran en pesos mexicanos (MXN) e incluyen IVA cuando aplica. Hacemos lo posible por mantener precios, existencias y descripciones actualizados, pero pueden cambiar sin previo aviso y la disponibilidad de un producto puede variar entre el momento en que lo agregas al carrito y el momento en que confirmas el pedido.
            </p>
            <p>
              Si por un error evidente (de captura, de sistema o similar) un producto aparece con un precio claramente incorrecto, nos reservamos el derecho de cancelar ese pedido o esa línea del pedido, notificándote y reembolsando cualquier cobro ya realizado.
            </p>
          </section>

          <section id="promociones">
            <h2 className="font-semibold text-diose-black mb-2">6. Cupones y promociones</h2>
            <p>
              Los cupones de descuento y promociones son válidos solo durante su vigencia y en las condiciones con que se publican; podemos limitarlos por producto, monto mínimo o número de usos, y no son acumulables entre sí salvo que se indique lo contrario.
            </p>
          </section>

          <section id="compra">
            <h2 className="font-semibold text-diose-black mb-2">7. Proceso de compra</h2>
            <p>
              Un pedido se considera recibido cuando completas el proceso de checkout y, en su caso, se confirma el pago. Te enviamos una confirmación por correo electrónico con el número de pedido. Verificamos existencias antes de cobrar; si algún producto no está disponible te lo haremos saber para ajustar o cancelar esa parte del pedido.
            </p>
          </section>

          <section id="pago">
            <h2 className="font-semibold text-diose-black mb-2">8. Métodos de pago</h2>
            <p>Aceptamos los siguientes métodos, seleccionables al momento del checkout:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li><strong>Tarjeta de crédito o débito</strong>, procesada por Mercado Pago. Tu número de tarjeta nunca pasa por nuestros servidores ni lo almacenamos: se captura directamente en la plataforma de Mercado Pago.</li>
              <li><strong>Transferencia bancaria.</strong></li>
              <li><strong>Efectivo</strong>, pagadero en sucursal.</li>
              <li><strong>Cotización por WhatsApp</strong>, para pedidos que requieren atención personalizada antes de confirmar forma de pago.</li>
            </ul>
          </section>

          <section id="facturacion">
            <h2 className="font-semibold text-diose-black mb-2">9. Facturación</h2>
            <p>
              Sí emitimos factura fiscal (CFDI) para tu compra. Si la necesitas, escríbenos a{" "}
              <strong>{settings.email}</strong> con tu número de pedido y tus datos fiscales: RFC, nombre o razón
              social, código postal fiscal, régimen fiscal y uso de CFDI. Normalmente la recibirás en un plazo de
              una hora o menos.
            </p>
          </section>

          <section id="envios">
            <h2 className="font-semibold text-diose-black mb-2">10. Envíos y entregas</h2>
            <p>
              El envío dentro de Ciudad Juárez es gratuito. Para el resto del país, el costo se calcula automáticamente en el checkout según el peso de tu pedido y se muestra antes de confirmar la compra. Los tiempos de entrega son estimados y pueden variar por disponibilidad, zona o condiciones fuera de nuestro control (clima, transportista, vialidades).
            </p>
            <p>
              Para envíos foráneos, el pedido se entrega a la paquetería que hayamos contratado; a partir de ese momento, el traslado corre a cargo del transportista conforme a sus propias condiciones de servicio. Revisa la sección de <a href="/devoluciones#envios" className="underline">Envíos y Devoluciones</a> para más detalle.
            </p>
          </section>

          <section id="cancelaciones">
            <h2 className="font-semibold text-diose-black mb-2">11. Cancelaciones</h2>
            <p>
              Puedes cancelar un pedido tú mismo desde &ldquo;Mi cuenta&rdquo; mientras su estado sea <strong>pendiente</strong>. Una vez que un pedido pasa a confirmado, en camino o entregado, contáctanos directamente y evaluaremos la cancelación caso por caso, según el punto del proceso en que se encuentre.
            </p>
          </section>

          <section id="devoluciones">
            <h2 className="font-semibold text-diose-black mb-2">12. Devoluciones y garantías</h2>
            <p>
              Aceptamos devoluciones y cambios dentro de los 7 días naturales posteriores a la entrega, y respetamos la garantía de fábrica de los productos que vendemos. Las condiciones, excepciones y el procedimiento completo están en nuestra página de{" "}
              <a href="/devoluciones" className="underline">Envíos, Devoluciones y Garantías</a>, que forma parte de estos Términos.
            </p>
          </section>

          <section id="uso-seguro">
            <h2 className="font-semibold text-diose-black mb-2">13. Uso seguro de los productos</h2>
            <p>
              Varios de los productos que vendemos (pinturas, selladores, cementos, químicos industriales y similares) deben usarse siguiendo las indicaciones, precauciones y advertencias de su etiqueta y ficha técnica. DIOSE no es responsable por daños derivados de un uso, almacenamiento o manejo inadecuado de los productos por parte del comprador. Para trabajos que impliquen riesgo, recomendamos la instalación o aplicación por personal capacitado.
            </p>
          </section>

          <section id="uso-del-sitio">
            <h2 className="font-semibold text-diose-black mb-2">14. Uso permitido del sitio</h2>
            <p>
              No está permitido usar el sitio con fines ilegales o fraudulentos, intentar vulnerar su seguridad, extraer datos de forma masiva (scraping), suplantar a otra persona o interferir con su funcionamiento normal. Podemos restringir el acceso a quien incumpla esto.
            </p>
          </section>

          <section id="propiedad-intelectual">
            <h2 className="font-semibold text-diose-black mb-2">15. Propiedad intelectual</h2>
            <p>
              El logotipo, nombre comercial, textos, fotografías e imágenes de este sitio pertenecen a DIOSE o a sus respectivos titulares y están protegidos por la legislación aplicable en materia de propiedad intelectual. No pueden reproducirse ni usarse con fines comerciales sin autorización previa por escrito.
            </p>
          </section>

          <section id="responsabilidad">
            <h2 className="font-semibold text-diose-black mb-2">16. Limitación de responsabilidad</h2>
            <p>
              Salvo en los casos que la ley no permita limitar (como dolo o negligencia grave), DIOSE no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de los productos adquiridos o del sitio. Nuestra responsabilidad máxima frente a ti, por cualquier reclamo relacionado con un pedido, se limita al monto efectivamente pagado por ese pedido.
            </p>
          </section>

          <section id="fuerza-mayor">
            <h2 className="font-semibold text-diose-black mb-2">17. Caso fortuito o fuerza mayor</h2>
            <p>
              No seremos responsables por retrasos o incumplimientos causados por hechos fuera de nuestro control razonable, como desastres naturales, fallas generalizadas de proveedores logísticos, contingencias sanitarias o disposiciones de autoridad.
            </p>
          </section>

          <section id="modificaciones">
            <h2 className="font-semibold text-diose-black mb-2">18. Modificaciones</h2>
            <p>
              Podemos actualizar estos Términos en cualquier momento; los cambios aplican a partir de su publicación en esta página. Si ya hiciste un pedido, ese pedido se rige por los términos vigentes al momento en que lo confirmaste.
            </p>
          </section>

          <section id="jurisdiccion">
            <h2 className="font-semibold text-diose-black mb-2">19. Legislación aplicable</h2>
            <p>
              Estos Términos se rigen por las leyes federales de México y las del estado de Chihuahua. Para cualquier controversia, las partes se someten a los tribunales competentes de Ciudad Juárez, Chihuahua, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro.
            </p>
          </section>

          <section id="quejas">
            <h2 className="font-semibold text-diose-black mb-2">20. Quejas y PROFECO</h2>
            <p>
              Si tienes una inconformidad, contáctanos primero para resolverla directamente. Como consumidor, también tienes derecho a acudir a la Procuraduría Federal del Consumidor (PROFECO) a través de <span className="whitespace-nowrap">profeco.gob.mx</span>.
            </p>
          </section>

          <section id="contacto">
            <h2 className="font-semibold text-diose-black mb-2">21. Contacto</h2>
            <p>
              Para dudas sobre estos Términos, escríbenos a <strong>{settings.email}</strong>, llámanos al <strong>{settings.phone}</strong> o visita nuestra <a href="/contacto" className="underline">página de contacto</a>.
            </p>
          </section>

          <p className="text-xs text-gray-400 mt-4">Última actualización: agosto 2026.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
