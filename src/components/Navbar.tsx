import Link from "next/link";
import Logo from "./Logo";
import { SearchIcon, CartIcon, UserIcon } from "./icons";
import { getSiteSettings } from "@/lib/data";

const LINKS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Herramientas", href: "/catalogo?categoria=herramientas" },
  { label: "Materiales", href: "/catalogo?categoria=materiales" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export default async function Navbar({ active, cartCount = 3 }: { active?: string; cartCount?: number }) {
  const settings = await getSiteSettings();
  return (
    <nav className="sticky top-0 z-20 h-16 bg-white border-b border-diose-border-light flex items-center justify-between px-6 md:px-12">
      <Link href="/">
        <Logo invert />
      </Link>

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

      <div className="flex gap-6 items-center">
        <SearchIcon className="cursor-pointer" />
        <Link href="/carrito" className="relative cursor-pointer">
          <CartIcon />
          {cartCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-diose-amber rounded-full flex items-center justify-center">
              <span className="text-[9px] font-semibold text-white">{cartCount}</span>
            </div>
          )}
        </Link>
        <Link href="/cuenta" className="cursor-pointer">
          <UserIcon />
        </Link>
        <a
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-diose-amber text-white px-5 py-2 text-xs font-medium tracking-[0.08em] cursor-pointer hidden sm:inline-block"
        >
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
