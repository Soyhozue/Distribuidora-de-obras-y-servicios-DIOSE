"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Logo from "@/components/Logo";

function ConfirmacionContent() {
  const params = useSearchParams();
  const number = params.get("n");

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 text-center">
      <Link href="/">
        <Logo invert />
      </Link>

      <div className="mt-10 w-16 h-16 rounded-full bg-diose-success/10 border-2 border-diose-success flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="mt-6 font-heading text-4xl text-diose-black tracking-[0.04em]">
        ¡Pedido confirmado!
      </h1>

      {number && (
        <p className="mt-2 text-sm text-gray-500">
          Número de pedido: <span className="font-semibold text-diose-black">#{number}</span>
        </p>
      )}

      <p className="mt-4 text-sm text-gray-500 max-w-sm">
        Recibimos tu pedido. Nos pondremos en contacto contigo en breve para coordinar el pago y la entrega.
      </p>

      <div className="mt-8 flex gap-3 flex-wrap justify-center">
        <Link
          href="/cuenta"
          className="bg-diose-black text-white px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/catalogo"
          className="border border-diose-black text-diose-black px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense>
      <ConfirmacionContent />
    </Suspense>
  );
}
