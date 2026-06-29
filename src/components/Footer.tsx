import Logo from "./Logo";
import { PinIcon, PhoneIcon, MailIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="bg-diose-black text-white px-6 md:px-20 py-14">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        <div>
          <Logo invert />
          <p className="text-[13px] text-white/50 mt-4 max-w-xs leading-relaxed">
            Materiales de construcción, herramientas profesionales y suministros para cada obra en Ciudad Juárez.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40 mb-1">
            Contacto
          </span>
          <div className="flex items-center gap-3">
            <PhoneIcon color="rgba(255,255,255,.6)" />
            <span className="text-[13px] text-white/70">+52 (656) 123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <MailIcon color="rgba(255,255,255,.6)" />
            <span className="text-[13px] text-white/70">contacto@diose.mx</span>
          </div>
          <div className="flex items-center gap-3">
            <PinIcon color="rgba(255,255,255,.6)" />
            <span className="text-[13px] text-white/70">
              Av. de las Torres 1234, Col. Industrial, Cd. Juárez, Chih.
            </span>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 text-[11px] text-white/30 tracking-[0.04em]">
        © {new Date().getFullYear()} DIOSE — Ciudad Juárez, Chihuahua
      </div>
    </footer>
  );
}
