"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "diose-cookie-notice-dismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = !!localStorage.getItem(STORAGE_KEY);
    } catch {
      dismissed = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time check of localStorage on mount, unavoidable (client-only API)
    setVisible(!dismissed);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-diose-black text-white px-5 py-4 md:px-8 animate-admin-in">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-[12.5px] text-white/70 leading-relaxed flex-1 text-center sm:text-left">
          Usamos cookies estrictamente necesarias para que el sitio funcione (carrito, sesión, preferencias). No
          usamos cookies de rastreo publicitario. Consulta nuestro{" "}
          <Link href="/privacidad" className="underline text-white hover:text-diose-amber">
            aviso de privacidad
          </Link>
          .
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 bg-diose-amber hover:bg-diose-amber-dark transition-colors text-white text-xs font-semibold tracking-[0.06em] px-5 py-2.5 cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
