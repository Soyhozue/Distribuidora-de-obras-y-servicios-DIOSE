import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalNav from "@/components/legal/LegalNav";
import LegalToc from "@/components/legal/LegalToc";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 0;

export const metadata = {
  title: "Envíos, Devoluciones y Garantías",
  description: "Política de envíos, cancelaciones, devoluciones y garantías de DIOSE.",
};

const SECTIONS = [
  { id: "envios", label: "Envíos" },
  { id: "recepcion", label: "Al recibir tu pedido" },
  { id: "cancelaciones", label: "Cancelación de pedidos" },
  { id: "devoluciones-cambios", label: "Devoluciones y cambios" },
  { id: "excepciones", label: "Qué no aplica para devolución" },
  { id: "garantia", label: "Garantía de fábrica" },
  { id: "reembolsos", label: "Reembolsos" },
  { id: "contacto", label: "Cómo iniciar el proceso" },
];

export default async function DevolucionesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="font-heading text-4xl text-diose-black tracking-[0.06em] mb-4">Envíos, Devoluciones y Garantías</h1>
        <p className="text-sm text-gray-500 mb-6">
          Esta política es parte de nuestros <a href="/terminos" className="underline">Términos y Condiciones</a> y detalla cómo funcionan los envíos, cancelaciones, devoluciones y garantías.
        </p>
        <LegalNav current="devoluciones" />

        <div className="prose prose-sm text-gray-700 leading-relaxed flex flex-col gap-8">
          <LegalToc items={SECTIONS} />

          <section id="envios">
            <h2 className="font-semibold text-diose-black mb-2">1. Envíos</h2>
            <p>
              <strong>Ciudad Juárez:</strong> el envío es gratuito para cualquier pedido dentro de la ciudad.
            </p>
            <p>
              <strong>Resto del país:</strong> el costo se calcula automáticamente en el checkout según el peso total
              de tu pedido, y se muestra antes de confirmar la compra — nunca se cobra un monto que no hayas visto y
              aceptado primero.
            </p>
            <p>
              Los tiempos de entrega mostrados en el sitio son estimados. Pueden variar por disponibilidad de
              producto, zona de entrega o factores fuera de nuestro control, como condiciones climáticas o del
              transportista.
            </p>
          </section>

          <section id="recepcion">
            <h2 className="font-semibold text-diose-black mb-2">2. Al recibir tu pedido</h2>
            <p>
              Revisa tu pedido al momento de recibirlo. Si el paquete llega visiblemente dañado o falta algún
              producto, repórtalo dentro de las 48 horas siguientes a <strong>{settings.email}</strong> o al{" "}
              <strong>{settings.phone}</strong>, indicando tu número de pedido y, de ser posible, fotos del daño.
            </p>
          </section>

          <section id="cancelaciones">
            <h2 className="font-semibold text-diose-black mb-2">3. Cancelación de pedidos</h2>
            <p>
              Mientras tu pedido esté en estado <strong>pendiente</strong>, puedes cancelarlo tú mismo desde &ldquo;Mi
              cuenta → Mis pedidos&rdquo;, sin necesidad de contactarnos. Una vez que pasa a confirmado, en camino o
              entregado, escríbenos y evaluaremos la cancelación según qué tan avanzado esté el proceso (por ejemplo,
              si ya fue entregado a la paquetería).
            </p>
          </section>

          <section id="devoluciones-cambios">
            <h2 className="font-semibold text-diose-black mb-2">4. Devoluciones y cambios</h2>
            <p>
              Puedes solicitar la devolución o el cambio de un producto dentro de los <strong>7 días naturales</strong>{" "}
              posteriores a la entrega, si se cumplen estas condiciones:
            </p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li>El producto está sin usar, en su empaque original y con todos sus accesorios.</li>
              <li>Conservas tu comprobante de compra (correo de confirmación o número de pedido).</li>
              <li>El producto no está dentro de las excepciones de la siguiente sección.</li>
            </ul>
            <p>
              Si el producto llegó dañado, incompleto o distinto a lo que pediste, cubrimos nosotros el costo de la
              devolución. Si es un cambio de opinión sobre un producto en buen estado, el costo de envío de la
              devolución corre por cuenta del cliente, salvo que se trate de un pedido con envío local gratuito
              recogido en sucursal.
            </p>
          </section>

          <section id="excepciones">
            <h2 className="font-semibold text-diose-black mb-2">5. Qué no aplica para devolución</h2>
            <p>Por razones de seguridad e higiene, no aceptamos devolución de:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li>Pinturas, selladores, adhesivos, cemento y otros productos químicos o a granel ya abiertos o mezclados.</li>
              <li>Material cortado, mezclado o preparado a la medida de tu pedido.</li>
              <li>Productos usados o instalados.</li>
            </ul>
            <p>Estos productos sí quedan cubiertos por garantía de fábrica si presentan un defecto (ver sección siguiente).</p>
          </section>

          <section id="garantia">
            <h2 className="font-semibold text-diose-black mb-2">6. Garantía de fábrica</h2>
            <p>
              Los productos que vendemos cuentan con la garantía que ofrece su fabricante o marca, además de las
              garantías mínimas que reconoce la Ley Federal de Protección al Consumidor para productos nuevos. Si
              recibes un producto con un defecto de fabricación, contáctanos dentro de un plazo razonable: gestionamos
              contigo la reparación, reposición o reembolso, según lo que aplique para ese producto y marca.
            </p>
          </section>

          <section id="reembolsos">
            <h2 className="font-semibold text-diose-black mb-2">7. Reembolsos</h2>
            <p>Una vez aprobada tu devolución, reembolsamos según el método de pago original:</p>
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li><strong>Tarjeta (Mercado Pago):</strong> el reembolso se procesa a través de Mercado Pago; el tiempo en que se refleja depende de tu banco.</li>
              <li><strong>Transferencia bancaria:</strong> reembolsamos a la misma cuenta de origen en un plazo razonable tras confirmar la devolución.</li>
              <li><strong>Efectivo:</strong> se reembolsa en sucursal o por transferencia, según prefieras.</li>
            </ul>
          </section>

          <section id="contacto">
            <h2 className="font-semibold text-diose-black mb-2">8. Cómo iniciar el proceso</h2>
            <p>
              Escríbenos a <strong>{settings.email}</strong> o al <strong>{settings.phone}</strong> con tu número de
              pedido y el motivo de tu solicitud. Te confirmaremos los siguientes pasos y, si aplica, cómo hacernos
              llegar el producto.
            </p>
          </section>

          <p className="text-xs text-gray-400 mt-4">Última actualización: agosto 2026.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
