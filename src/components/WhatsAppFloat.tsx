import { WhatsAppIcon } from "./icons";
import { getSiteSettings } from "@/lib/data";

export default async function WhatsAppFloat() {
  const settings = await getSiteSettings();
  return (
    <a
      href={`https://wa.me/${settings.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-4 md:bottom-7 md:right-8 w-[48px] h-[48px] md:w-[52px] md:h-[52px] bg-[#25D366] rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_24px_rgba(37,211,102,0.6)] z-30"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
