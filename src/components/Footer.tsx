import Link from "next/link";
import Logo from "./Logo";
import { PinIcon, PhoneIcon, MailIcon } from "./icons";
import { getSiteSettings } from "@/lib/data";

const NAV = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export default async function Footer() {
  const settings = await getSiteSettings();
  return (
    <footer className="bg-diose-black text-white px-6 md:px-20 pt-10 pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">

        {/* Marca */}
        <div>
          <Logo />
          <p className="text-[13px] text-white/50 mt-3 max-w-xs leading-relaxed">
            Materiales de construcción, herramientas profesionales y suministros para cada obra en Ciudad Juárez.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40 block mb-3">
            Navegación
          </span>
          <div className="flex flex-col gap-2">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-white/60 hover:text-white transition-colors w-fit"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div>
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40 block mb-3">
            Contacto
          </span>
          <div className="flex flex-col gap-2.5">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-3 group">
                <PhoneIcon color="rgba(255,255,255,.5)" />
                <span className="text-[13px] text-white/60 group-hover:text-white transition-colors">
                  {settings.phone}
                </span>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-3 group">
                <MailIcon color="rgba(255,255,255,.5)" />
                <span className="text-[13px] text-white/60 group-hover:text-white transition-colors">
                  {settings.email}
                </span>
              </a>
            )}
            {settings.address && (
              <div className="flex items-start gap-3">
                <PinIcon color="rgba(255,255,255,.5)" />
                <span className="text-[13px] text-white/60 leading-relaxed">
                  {settings.address}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-[11px] text-white/30 tracking-[0.04em]">
          © {new Date().getFullYear()} DIOSE — Ciudad Juárez, Chihuahua
        </span>
        <span className="text-[11px] text-white/20">
          Todos los derechos reservados
        </span>
      </div>
    </footer>
  );
}
