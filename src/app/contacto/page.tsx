import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { PinIcon } from "@/components/icons";
import { getSiteSettings } from "@/lib/data";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar active="Contacto" />

      <div className="bg-diose-black flex flex-wrap items-baseline gap-5 px-6 md:px-20 py-6">
        <h1 className="font-heading text-4xl text-white tracking-[0.06em]">Contacto</h1>
        <span className="text-[13px] text-white/40 tracking-[0.04em]">
          Estamos en Ciudad Juárez, Chihuahua
        </span>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        <ContactForm settings={settings} />

        {/* MAP PLACEHOLDER */}
        <div
          className="w-full md:w-[580px] shrink-0 bg-[#F0F0F0] relative flex items-center justify-center min-h-[320px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.03) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        >
          <div className="text-center">
            <div className="w-10 h-10 bg-diose-black rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-white mt-1" />
            </div>
            <div className="text-[13px] font-medium text-diose-black mb-1">DIOSE</div>
            <div className="text-[11px] text-gray-400 tracking-[0.04em]">Ciudad Juárez, Chihuahua</div>
          </div>
          <a
            href="https://maps.google.com/?q=Ciudad+Juárez,Chihuahua"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-5 right-5 bg-white border border-diose-border px-4 py-2 flex items-center gap-2 cursor-pointer"
          >
            <PinIcon size={13} color="#333" />
            <span className="text-xs text-gray-700 tracking-[0.04em]">Ver en Google Maps</span>
          </a>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
