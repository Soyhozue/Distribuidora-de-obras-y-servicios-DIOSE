import { WhatsAppIcon } from "./icons";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/526561234567"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-7 right-8 w-[44px] h-[44px] md:w-[50px] md:h-[50px] bg-diose-black rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_24px_rgba(0,0,0,0.55)] z-30"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
