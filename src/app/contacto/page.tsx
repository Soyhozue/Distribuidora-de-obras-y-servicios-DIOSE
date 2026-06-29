import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { PinIcon } from "@/components/icons";
import { getSiteSettings } from "@/lib/data";
import ContactForm from "./ContactForm";

function extractMapInfo(address: string, mapsInput: string) {
  const input = mapsInput.trim();

  // Pasted the full <iframe> embed code from Google Maps' "Insertar un mapa" tab.
  const iframeSrcMatch = input.match(/<iframe[^>]*\ssrc="([^"]+)"/i);
  if (iframeSrcMatch) {
    const embedSrc = iframeSrcMatch[1].replace(/&amp;/g, "&");
    const coords = embedSrc.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
    const link = coords ? `https://maps.google.com/?q=${coords[2]},${coords[1]}` : embedSrc;
    return { embedSrc, link };
  }

  // Pasted a regular Maps share link, possibly containing @lat,lng.
  const coords = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? input.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (coords) {
    return {
      embedSrc: `https://www.google.com/maps?q=${coords[1]},${coords[2]}&output=embed`,
      link: input || `https://maps.google.com/?q=${coords[1]},${coords[2]}`,
    };
  }

  return {
    embedSrc: `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`,
    link: input || `https://maps.google.com/?q=${encodeURIComponent(address)}`,
  };
}

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { embedSrc, link } = extractMapInfo(settings.address, settings.mapsUrl);

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
            src={embedSrc}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={link}
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
