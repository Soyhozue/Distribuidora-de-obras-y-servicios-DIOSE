"use client";

import { useState } from "react";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

type SiteSettings = { phone: string; email: string; address: string };

export default function ContactForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    if (!form.name || !form.email || !form.message) {
      setError("Completa nombre, correo y mensaje.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex-1 p-6 md:px-16 md:py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Nombre" placeholder="Tu nombre completo" value={form.name} onChange={(v) => update("name", v)} />
        <Field label="Teléfono" placeholder="+52 656 ..." value={form.phone} onChange={(v) => update("phone", v)} />
      </div>
      <div className="mb-4">
        <Field
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(v) => update("email", v)}
        />
      </div>
      <div className="mb-6">
        <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">Mensaje</div>
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          className="w-full h-30 border border-diose-border p-3.5 text-[13px] outline-none focus:border-diose-black resize-none"
        />
      </div>
      {error && <div className="text-xs text-diose-danger mb-3">{error}</div>}
      <button
        onClick={submit}
        disabled={sending}
        className="bg-diose-black hover:bg-diose-amber text-white px-10 py-3.5 text-[13px] font-semibold tracking-[0.1em] uppercase cursor-pointer inline-block transition-colors disabled:opacity-50"
      >
        {sending ? "Enviando..." : sent ? "Mensaje enviado ✓" : "Enviar mensaje"}
      </button>

      <div className="mt-7 pt-7 border-t border-gray-100">
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-4">
          O contáctanos directamente
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <PhoneIcon />
            <span className="text-[13px] text-gray-700">{settings.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <MailIcon />
            <span className="text-[13px] text-gray-700">{settings.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <PinIcon />
            <span className="text-[13px] text-gray-700">{settings.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-diose-border px-3.5 py-2.5 text-[13px] text-diose-black outline-none focus:border-diose-black placeholder:text-gray-400"
      />
    </div>
  );
}
