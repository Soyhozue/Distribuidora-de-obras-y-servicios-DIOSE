"use client";

import { useState } from "react";
import Link from "next/link";

export default function RecuperarClient({ token }: { token?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function requestReset() {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  async function doReset() {
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl text-diose-black tracking-[0.06em] mb-2">
          {token ? "Nueva contraseña" : "Recuperar contraseña"}
        </h1>

        {done ? (
          <div className="bg-green-50 border border-green-200 p-4 mt-6">
            <p className="text-sm text-green-700">
              {token
                ? "¡Contraseña actualizada! Ya puedes iniciar sesión."
                : "Si el correo existe, recibirás un enlace en tu bandeja de entrada."}
            </p>
            <Link href="/cuenta" className="text-sm font-semibold text-diose-black underline mt-3 inline-block">
              Ir a mi cuenta →
            </Link>
          </div>
        ) : token ? (
          <>
            <p className="text-sm text-gray-500 mb-6">Elige una nueva contraseña para tu cuenta.</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-diose-border px-3.5 py-3 text-sm outline-none focus:border-diose-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full border border-diose-border px-3.5 py-3 text-sm outline-none focus:border-diose-black"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={doReset}
                disabled={loading}
                className="bg-diose-black text-white py-3.5 text-xs font-semibold tracking-[0.1em] uppercase cursor-pointer disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Actualizar contraseña"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5 block">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && requestReset()}
                  placeholder="tu@correo.com"
                  className="w-full border border-diose-border px-3.5 py-3 text-sm outline-none focus:border-diose-black"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={requestReset}
                disabled={loading}
                className="bg-diose-black text-white py-3.5 text-xs font-semibold tracking-[0.1em] uppercase cursor-pointer disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
              <Link href="/cuenta" className="text-center text-xs text-gray-400 underline">
                Volver a iniciar sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
