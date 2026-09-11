import Link from "next/link";
import Logo from "./Logo";
import { CartIcon, UserIcon } from "./icons";
import CartBadge from "./CartBadge";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import AnnouncementBar from "./AnnouncementBar";
import CookieNotice from "./CookieNotice";
import { getSiteSettings } from "@/lib/data";

const LINKS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export default async function Navbar({ active }: { active?: string }) {
  const settings = await getSiteSettings();
  return (
    <>
    <AnnouncementBar
      text={settings.announcementText}
      bgColor={settings.announcementBgColor}
      textColor={settings.announcementTextColor}
      fontSize={settings.announcementFontSize}
      speed={settings.announcementSpeed}
      fontFamily={settings.announcementFontFamily}
    />
    <div className="sticky top-0 z-30 px-4 pt-3 pb-2 md:px-6 md:pt-4">
      <nav className="max-w-7xl mx-auto h-16 bg-white rounded-full shadow-[0_10px_26px_rgba(7,7,7,0.08)] border border-diose-border-light px-4 md:px-6">
        <div className="h-full flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Logo invert size={30} />
          </Link>

          {/* Desktop links — segmented pill */}
          <div className="hidden md:flex gap-1 items-center bg-diose-gray rounded-full p-1.5">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-[18px] py-2.5 rounded-full text-[12.5px] font-semibold tracking-[0.01em] transition-colors ${
                  active === link.label
                    ? "bg-diose-blue text-white"
                    : "text-diose-black/70 hover:text-diose-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex gap-2.5 md:gap-3 items-center">
            <span className="w-9 h-9 rounded-full bg-diose-gray flex items-center justify-center">
              <SearchBar />
            </span>
            <Link
              href="/carrito"
              className="relative cursor-pointer w-9 h-9 rounded-full bg-diose-gray flex items-center justify-center"
            >
              <CartIcon size={15} />
              <CartBadge />
            </Link>
            <Link
              href="/cuenta"
              className="cursor-pointer hidden sm:flex w-9 h-9 rounded-full bg-diose-gray items-center justify-center"
            >
              <UserIcon size={15} />
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-diose-green hover:brightness-95 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.04em] cursor-pointer hidden md:inline-block shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-[filter]"
            >
              WhatsApp
            </a>

            {/* Hamburger — mobile only */}
            <MobileMenu links={LINKS} whatsapp={settings.whatsapp} active={active} />
          </div>
        </div>
      </nav>
    </div>
    <CookieNotice />
    </>
  );
}
