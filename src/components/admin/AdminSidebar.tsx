"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pedidos", href: "/admin/pedidos" },
  { label: "Catálogo", href: "/admin/productos" },
  { label: "Inventario", href: "/admin/inventario" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Publicidad", href: "/admin/publicidad" },
  { label: "Configuración", href: "/admin/configuracion" },
];

export default function AdminSidebar({
  pendingOrders,
  lowStockCount,
}: {
  pendingOrders?: number;
  lowStockCount?: number;
}) {
  const pathname = usePathname();
  const badges: Record<string, number | undefined> = {
    Pedidos: pendingOrders,
    Inventario: lowStockCount,
  };
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

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
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const badge = badges[item.label];
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
              {!!badge && (
                <div className="ml-auto bg-white/10 px-2 py-0.5">
                  <span className="text-[10px] text-white/50">{badge}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div
        onClick={logout}
        className="px-7 py-5 border-t border-white/[0.07] flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04]"
      >
        <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-white">A</span>
        </div>
        <div>
          <div className="text-xs font-medium text-white">Administrador</div>
          <div className="text-[10px] text-white/35">Cerrar sesión</div>
        </div>
      </div>
    </div>
  );
}
