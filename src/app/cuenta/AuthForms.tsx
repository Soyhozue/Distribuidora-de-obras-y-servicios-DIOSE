"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setError("");
    if (mode === "register" && !acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones y el Aviso de Privacidad.");
      return;
    }
    if (mode === "register" && form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo salió mal");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-sm">
        <div className="flex border-b border-diose-border-light mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-sm font-medium tracking-[0.04em] cursor-pointer ${
              mode === "login" ? "text-diose-black border-b-2 border-diose-black" : "text-gray-400"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 text-sm font-medium tracking-[0.04em] cursor-pointer ${
              mode === "register" ? "text-diose-black border-b-2 border-diose-black" : "text-gray-400"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {mode === "register" && (
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nombre completo"
              className="border border-diose-border px-3.5 py-2.5 text-[13px] outline-none focus:border-diose-black"
            />
          )}
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Correo electrónico"
            className="border border-diose-border px-3.5 py-2.5 text-[13px] outline-none focus:border-diose-black"
          />
          {mode === "register" && (
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Teléfono (opcional)"
              className="border border-diose-border px-3.5 py-2.5 text-[13px] outline-none focus:border-diose-black"
            />
          )}
          <div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Contraseña"
              minLength={mode === "register" ? 8 : undefined}
              className="w-full border border-diose-border px-3.5 py-2.5 text-[13px] outline-none focus:border-diose-black"
            />
            {mode === "register" && (
              <div className="text-[10px] text-gray-400 mt-1">Mínimo 8 caracteres.</div>
            )}
          </div>

          {mode === "login" && (
            <div className="text-right">
              <Link href="/recuperar" className="text-[11px] text-gray-400 underline hover:text-diose-black">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}

          {mode === "register" && (
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-diose-black cursor-pointer"
              />
              <span className="text-[11px] text-gray-500 leading-relaxed">
                Acepto los{" "}
                <Link href="/terminos" target="_blank" className="underline text-diose-black hover:text-diose-amber">
                  Términos y Condiciones
                </Link>{" "}
                y el{" "}
                <Link href="/privacidad" target="_blank" className="underline text-diose-black hover:text-diose-amber">
                  Aviso de Privacidad
                </Link>.
              </span>
            </label>
          )}

          {error && <div className="text-xs text-diose-danger">{error}</div>}

          <button
            onClick={submit}
            disabled={loading || (mode === "register" && !acceptedTerms)}
            className="bg-diose-black hover:bg-diose-amber text-white py-3 text-[13px] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Cargando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
