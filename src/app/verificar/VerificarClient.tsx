"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "loading" | "ok" | "error" | "missing";

export default function VerificarClient({ token }: { token?: string }) {
  const [status, setStatus] = useState<Status>(token ? "loading" : "missing");

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => setStatus(r.ok ? "ok" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-heading text-2xl text-diose-black tracking-[0.06em] mb-4">Confirmar correo</h1>

        {status === "loading" && <p className="text-sm text-gray-500">Verificando tu correo...</p>}

        {status === "ok" && (
          <div className="bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-700">¡Correo confirmado! Ya puedes usar tu cuenta con normalidad.</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">
              El enlace ha expirado o ya fue usado. Puedes pedir uno nuevo desde tu cuenta.
            </p>
          </div>
        )}

        {status === "missing" && (
          <div className="bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">Este enlace no es válido.</p>
          </div>
        )}

        <Link href="/cuenta" className="text-sm font-semibold text-diose-black underline mt-5 inline-block">
          Ir a mi cuenta →
        </Link>
      </div>
    </div>
  );
}
