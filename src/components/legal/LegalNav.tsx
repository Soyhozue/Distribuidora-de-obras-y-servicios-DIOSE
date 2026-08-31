import Link from "next/link";

const LEGAL_PAGES = [
  { key: "terminos", href: "/terminos", label: "Términos y Condiciones" },
  { key: "privacidad", href: "/privacidad", label: "Aviso de Privacidad" },
  { key: "devoluciones", href: "/devoluciones", label: "Envíos y Devoluciones" },
] as const;

export default function LegalNav({ current }: { current: (typeof LEGAL_PAGES)[number]["key"] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {LEGAL_PAGES.map((p) => (
        <Link
          key={p.key}
          href={p.href}
          className={`text-[11px] tracking-[0.06em] uppercase px-3.5 py-2 border transition-colors ${
            p.key === current
              ? "border-diose-black bg-diose-black text-white"
              : "border-diose-border-light text-gray-500 hover:border-gray-400 hover:text-diose-black"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
