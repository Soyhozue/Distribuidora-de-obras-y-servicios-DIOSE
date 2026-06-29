import Logo from "./Logo";
import { PinIcon, PhoneIcon, MailIcon } from "./icons";
import { getSiteSettings } from "@/lib/data";

export default async function Footer() {
  const settings = await getSiteSettings();
  return (
    <footer className="bg-diose-black text-white px-6 md:px-20 py-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <Logo />
          <p className="text-[13px] text-white/50 mt-3 max-w-xs leading-relaxed">
            Materiales de construcción, herramientas profesionales y suministros para cada obra en Ciudad Juárez.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40 mb-0.5">
            Contacto
          </span>
          <div className="flex items-center gap-3">
            <PhoneIcon color="rgba(255,255,255,.6)" />
            <span className="text-[13px] text-white/70">{settings.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <MailIcon color="rgba(255,255,255,.6)" />
            <span className="text-[13px] text-white/70">{settings.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <PinIcon color="rgba(255,255,255,.6)" />
            <span className="text-[13px] text-white/70">{settings.address}</span>
          </div>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-white/30 tracking-[0.04em]">
        © {new Date().getFullYear()} DIOSE — Ciudad Juárez, Chihuahua
      </div>
    </footer>
  );
}
