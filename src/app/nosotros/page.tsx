import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const METRICS = [
  { value: "8", label: "Años de experiencia" },
  { value: "500+", label: "Productos en catálogo" },
  { value: "1.2K", label: "Clientes atendidos" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar active="Nosotros" />

      {/* DARK STATEMENT HERO */}
      <section
        className="relative bg-diose-black px-6 md:px-20 py-16 md:py-20 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(5,5,5,.93) 30%, rgba(5,5,5,.62) 70%, rgba(5,5,5,.4) 100%), url('/images/hero-warehouse.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      >
        <div className="relative z-10">
          <div className="text-[11px] text-white/35 tracking-[0.2em] uppercase mb-5">
            Distribuidora de obras y servicios
          </div>
          <h1 className="font-heading text-white text-5xl md:text-[88px] leading-[0.9] tracking-[0.02em]">
            MATERIALES
            <br />
            <span className="text-white/18">CON</span>
            <br />
            PROPÓSITO
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Story */}
        <div className="flex-1 p-10 md:p-16 border-b md:border-b-0 md:border-r border-diose-border-light">
          <div className="w-10 h-0.5 bg-diose-amber mb-6" />
          <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-4">
            Nuestra historia
          </div>
          <p className="text-base font-light text-gray-700 leading-relaxed mb-5 max-w-xl">
            DIOSE nació en 2018 en Ciudad Juárez como una respuesta directa a la necesidad de los
            constructores locales: acceso a materiales de calidad, en el lugar correcto, en el momento justo.
          </p>
          <p className="text-[15px] font-light text-gray-400 leading-relaxed max-w-xl">
            Hoy atendemos a más de 1,200 clientes entre contratistas, constructoras y particulares, con un
            catálogo de más de 500 productos y entrega en toda la zona metropolitana.
          </p>
        </div>

        {/* Metrics */}
        <div className="w-full md:w-[480px] p-10 md:p-14 bg-diose-gray shrink-0">
          <div className="grid grid-cols-2 h-full">
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                className={`p-7 ${i % 2 === 0 ? "border-r border-gray-200" : ""} ${
                  i < 2 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="font-heading text-[56px] text-diose-amber tracking-[0.02em] leading-none mb-1.5">
                  {m.value}
                </div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                  {m.label}
                </div>
              </div>
            ))}
            <div className="p-7">
              <div className="font-heading text-4xl text-diose-black tracking-[0.02em] leading-tight mb-1.5">
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
