"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 text-center">
      <div className="font-heading text-[8rem] leading-none text-diose-black tracking-tight select-none">
        500
      </div>
      <h1 className="mt-2 text-xl font-semibold text-diose-black tracking-[0.04em]">
        Algo salió mal
      </h1>
      <p className="mt-3 text-sm text-gray-500 max-w-sm">
        Ocurrió un error inesperado. Intenta de nuevo o regresa al inicio.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="bg-diose-black text-white px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase cursor-pointer"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="border border-diose-black text-diose-black px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
