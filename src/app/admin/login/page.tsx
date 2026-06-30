"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo salió mal");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-admin-in">
        <div className="font-heading text-4xl text-white tracking-[0.08em] mb-1.5 text-center">DIOSE</div>
        <div className="text-sm text-white/40 text-center mb-10 tracking-[0.04em]">Panel administrativo</div>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Correo de administrador"
            className="bg-white/5 border border-white/10 px-4 py-3.5 text-[15px] text-white outline-none focus:border-white/30 placeholder:text-white/30 rounded-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Contraseña"
            className="bg-white/5 border border-white/10 px-4 py-3.5 text-[15px] text-white outline-none focus:border-white/30 placeholder:text-white/30 rounded-sm"
          />

          {error && <div className="text-xs text-diose-danger">{error}</div>}

          <button
            onClick={submit}
            disabled={loading}
            className="bg-diose-amber hover:bg-diose-amber-dark text-white py-3.5 text-sm font-semibold tracking-[0.1em] uppercase cursor-pointer transition-colors disabled:opacity-50 mt-2 rounded-sm"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
