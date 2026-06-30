import Link from "next/link";
import Logo from "./Logo";
import { CartIcon, UserIcon } from "./icons";
import CartBadge from "./CartBadge";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import { getSiteSettings } from "@/lib/data";

const LINKS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export default async function Navbar({ active }: { active?: string }) {
  const settings = await getSiteSettings();
  return (
    <nav className="sticky top-0 z-30 h-16 bg-white border-b border-diose-border-light flex items-center justify-between px-5 md:px-12">
      {/* Logo */}
      <Link href="/" className="shrink-0">
        <Logo invert />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-9 items-center">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-[13px] tracking-[0.04em] transition-colors ${
              active === link.label
                ? "text-diose-black font-semibold border-b-2 border-diose-black pb-0.5"
                : "text-diose-black hover:text-diose-amber"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex gap-4 md:gap-6 items-center">
        <SearchBar />
        <Link href="/carrito" className="relative cursor-pointer">
          <CartIcon />
          <CartBadge />
        </Link>
        <Link href="/cuenta" className="cursor-pointer hidden sm:block">
          <UserIcon />
        </Link>
        <a
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-diose-amber text-white px-4 py-2 text-xs font-medium tracking-[0.08em] cursor-pointer hidden md:inline-block"
        >
          WhatsApp
        </a>

        {/* Hamburger — mobile only */}
        <MobileMenu links={LINKS} whatsapp={settings.whatsapp} active={active} />
      </div>
    </nav>
  );
}
