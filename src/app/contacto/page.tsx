import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { PinIcon } from "@/components/icons";
import { getSiteSettings } from "@/lib/data";
import ContactForm from "./ContactForm";

function mapsLink(address: string, mapsUrl: string) {
  return mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

function mapsEmbedUrl(address: string, mapsUrl: string) {
  const coords = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? mapsUrl.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
  if (coords) {
    return `https://www.google.com/maps?q=${coords[1]},${coords[2]}&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

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

        {/* MAP */}
        <div className="w-full md:w-[580px] shrink-0 relative min-h-[320px]">
          <iframe
            src={mapsEmbedUrl(settings.address, settings.mapsUrl)}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={mapsLink(settings.address, settings.mapsUrl)}
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
