import Link from "next/link";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pedidos", href: "/admin/pedidos", badge: "7" },
  { label: "Catálogo", href: "/admin/productos" },
  { label: "Inventario", href: "/admin/productos", badge: "3" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Publicidad", href: "/admin/publicidad", tag: "Nuevo" },
];

export default function AdminSidebar({ active }: { active: string }) {
  return (
    <div className="w-60 bg-[#0C0C0C] shrink-0 flex flex-col">
      <div className="px-7 py-6 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="20" viewBox="0 0 56 50" fill="none">
            <path d="M28 3 L54 48 L2 48 Z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M17 32 Q28 22 39 32 Q28 42 17 32 Z" stroke="#fff" strokeWidth="1.4" fill="#fff" fillOpacity="0.08" />
            <circle cx="28" cy="32" r="4.5" fill="#fff" />
            <path d="M17 32 Q11 36 8 42" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <line x1="28" y1="25" x2="28" y2="21" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <div>
            <div className="font-heading text-lg text-white tracking-[0.1em]">DIOSE</div>
            <div className="text-[9px] text-white/35 tracking-[0.14em] uppercase -mt-0.5">Admin</div>
          </div>
        </div>
      </div>

      <div className="flex-1 py-5 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const isActive = item.label === active;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-7 py-2.5 cursor-pointer ${
                isActive ? "bg-white/[0.08] border-l-[3px] border-diose-amber pl-[25px]" : ""
              }`}
            >
              <span
                className={`text-[13px] tracking-[0.03em] ${
                  isActive ? "text-white font-medium" : "text-white/40"
                }`}
              >
                {item.label}
              </span>
              {item.badge && (
                <div className="ml-auto bg-white/10 px-2 py-0.5">
                  <span className="text-[10px] text-white/50">{item.badge}</span>
                </div>
              )}
              {item.tag && (
                <span className="ml-auto text-[9px] text-white/28 tracking-[0.1em] uppercase">{item.tag}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="px-7 py-5 border-t border-white/[0.07] flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-white">A</span>
        </div>
        <div>
          <div className="text-xs font-medium text-white">Administrador</div>
          <div className="text-[10px] text-white/35">admin@diose.mx</div>
        </div>
      </div>
    </div>
  );
}
