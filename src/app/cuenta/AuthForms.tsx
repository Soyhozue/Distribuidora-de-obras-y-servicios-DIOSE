"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setError("");
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
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Contraseña"
            className="border border-diose-border px-3.5 py-2.5 text-[13px] outline-none focus:border-diose-black"
          />

          {error && <div className="text-xs text-diose-danger">{error}</div>}

          <button
            onClick={submit}
            disabled={loading}
            className="bg-diose-black hover:bg-diose-amber text-white py-3 text-[13px] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Cargando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
