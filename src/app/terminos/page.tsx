import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Términos y Condiciones | DIOSE",
  description: "Términos y condiciones de uso de DIOSE.",
};

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="font-heading text-4xl text-diose-black tracking-[0.06em] mb-8">Términos y Condiciones</h1>
        <div className="prose prose-sm text-gray-700 leading-relaxed flex flex-col gap-6">
          <section>
            <h2 className="font-semibold text-diose-black mb-2">1. Aceptación de los términos</h2>
            <p>Al acceder y utilizar el sitio web de DIOSE (Distribuidora de Obras y Servicios Especializados), aceptas cumplir con los presentes términos y condiciones. Si no estás de acuerdo, te pedimos que no utilices nuestros servicios.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">2. Uso del sitio</h2>
            <p>Este sitio está destinado exclusivamente a usuarios mayores de 18 años que busquen adquirir materiales de construcción, herramientas y suministros para uso personal o profesional. Queda prohibido el uso del sitio para fines ilegales o fraudulentos.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">3. Productos y precios</h2>
            <p>Los precios mostrados en el sitio están en pesos mexicanos (MXN) e incluyen IVA cuando corresponda. Nos reservamos el derecho de modificar precios, disponibilidad y especificaciones de productos sin previo aviso. Los precios confirmados en el momento del pedido serán los definitivos.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">4. Pedidos y pagos</h2>
            <p>Al realizar un pedido, recibirás una confirmación por correo electrónico. El pedido no será definitivo hasta recibir confirmación de disponibilidad y pago. Aceptamos transferencia bancaria, pago en efectivo y otros métodos indicados en el proceso de compra.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">5. Entregas</h2>
            <p>Las entregas se realizan en Ciudad Juárez, Chihuahua. Los tiempos de entrega son estimados y pueden variar según disponibilidad y zona. El costo de envío se calcula al momento del pedido.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">6. Devoluciones</h2>
            <p>Aceptamos devoluciones dentro de los 7 días naturales posteriores a la entrega, siempre que el producto esté en condiciones originales y sin uso. Contacta a nuestro equipo para iniciar el proceso.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">7. Limitación de responsabilidad</h2>
            <p>DIOSE no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de los productos adquiridos. La responsabilidad máxima estará limitada al monto pagado por el pedido en cuestión.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">8. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en este sitio.</p>
          </section>
          <section>
            <h2 className="font-semibold text-diose-black mb-2">9. Contacto</h2>
            <p>Para cualquier duda relacionada con estos términos, comunícate con nosotros a través de nuestra página de contacto o al correo <strong>contacto@diose.mx</strong>.</p>
          </section>
          <p className="text-xs text-gray-400 mt-4">Última actualización: junio 2026</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
