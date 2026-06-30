import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata = {
  title: "Nosotros | DIOSE",
  description: "Conoce la historia de DIOSE, distribuidora de materiales de construcción y herramientas en Ciudad Juárez.",
};

export default async function AboutPage() {
  const [productCount, orderCount, userCount] = await Promise.all([
    prisma.product.count({ where: { stockStatus: { not: "AGOTADO" } } }),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  const metrics = [
    { value: "2018", label: "Año de fundación" },
    { value: `${productCount}+`, label: "Productos en catálogo" },
    { value: userCount > 0 ? `${userCount}+` : "—", label: "Clientes registrados" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar active="Nosotros" />

      {/* HERO */}
      <section className="relative bg-diose-black px-6 md:px-20 py-16 md:py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/hero-warehouse.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
          }}
        />
        <div className="relative z-10">
          <div className="text-[11px] text-white/35 tracking-[0.2em] uppercase mb-5">
            Distribuidora de obras y servicios
          </div>
          <h1 className="font-heading text-white text-5xl md:text-[88px] leading-[0.9] tracking-[0.02em]">
            MATERIALES
            <br />
            <span className="text-white/20">CON</span>
            <br />
            PROPÓSITO
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Historia */}
        <div className="flex-1 p-8 md:p-16 border-b md:border-b-0 md:border-r border-diose-border-light">
          <div className="w-10 h-0.5 bg-diose-amber mb-6" />
          <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-4">
            Nuestra historia
          </div>
          <p className="text-base font-light text-gray-700 leading-relaxed mb-5 max-w-xl">
            DIOSE nació en 2018 en Ciudad Juárez como una respuesta directa a la necesidad de los
            constructores locales: acceso a materiales de calidad, en el lugar correcto, en el momento justo.
          </p>
          <p className="text-[15px] font-light text-gray-400 leading-relaxed max-w-xl">
            Hoy atendemos a contratistas, constructoras y particulares con un catálogo amplio de productos
            y entrega en toda la zona metropolitana de Ciudad Juárez.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "✓", text: "Productos certificados de calidad" },
              { icon: "✓", text: "Entrega rápida en Ciudad Juárez" },
              { icon: "✓", text: "Atención personalizada" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                <span className="text-diose-amber font-bold text-sm mt-0.5">{item.icon}</span>
                <span className="text-[13px] text-gray-600 leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas reales */}
        <div className="w-full md:w-[420px] p-8 md:p-14 bg-diose-gray shrink-0">
          <div className="grid grid-cols-2 gap-0">
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className={`p-6 ${i % 2 === 0 ? "border-r border-gray-200" : ""} ${
                  i < 2 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="font-heading text-[48px] md:text-[56px] text-diose-amber tracking-[0.02em] leading-none mb-1.5">
                  {m.value}
                </div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                  {m.label}
                </div>
              </div>
            ))}
            <div className="p-6">
              <div className="font-heading text-3xl md:text-4xl text-diose-black tracking-[0.02em] leading-tight mb-1.5">
                Cd. Juárez
              </div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                Chihuahua, México
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
