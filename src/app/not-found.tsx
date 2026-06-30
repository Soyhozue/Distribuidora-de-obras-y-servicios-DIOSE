import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 text-center">
      <Logo invert />
      <div className="mt-10 font-heading text-[10rem] leading-none text-diose-black tracking-tight select-none">
        404
      </div>
      <h1 className="mt-2 text-xl font-semibold text-diose-black tracking-[0.04em]">
        Página no encontrada
      </h1>
      <p className="mt-3 text-sm text-gray-500 max-w-sm">
        La página que buscas no existe o fue movida. Regresa al inicio para seguir explorando.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="bg-diose-black text-white px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
        >
          Ir al inicio
        </Link>
        <Link
          href="/catalogo"
          className="border border-diose-black text-diose-black px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
