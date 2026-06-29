"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar active="Contacto" />

      <div className="bg-diose-black flex flex-wrap items-baseline gap-5 px-6 md:px-20 py-6">
        <h1 className="font-heading text-4xl text-white tracking-[0.06em]">Contacto</h1>
        <span className="text-[13px] text-white/40 tracking-[0.04em]">
          Estamos en Ciudad Juárez, Chihuahua
        </span>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        {/* FORM */}
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
            <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">
              Mensaje
            </div>
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full h-30 border border-diose-border p-3.5 text-[13px] outline-none focus:border-diose-black resize-none"
            />
          </div>
          <button
            onClick={() => setSent(true)}
            className="bg-diose-black hover:bg-diose-amber text-white px-10 py-3.5 text-[13px] font-semibold tracking-[0.1em] uppercase cursor-pointer inline-block transition-colors"
          >
            {sent ? "Mensaje enviado" : "Enviar mensaje"}
          </button>

          <div className="mt-7 pt-7 border-t border-gray-100">
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-4">
              O contáctanos directamente
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <PhoneIcon />
                <span className="text-[13px] text-gray-700">+52 (656) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon />
                <span className="text-[13px] text-gray-700">contacto@diose.mx</span>
              </div>
              <div className="flex items-center gap-3">
                <PinIcon />
                <span className="text-[13px] text-gray-700">
                  Av. de las Torres 1234, Col. Industrial, Cd. Juárez, Chih.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAP PLACEHOLDER */}
        <div
          className="w-full md:w-[580px] shrink-0 bg-[#F0F0F0] relative flex items-center justify-center min-h-[320px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.03) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        >
          <div className="text-center">
            <div className="w-10 h-10 bg-diose-black rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-white mt-1" />
            </div>
            <div className="text-[13px] font-medium text-diose-black mb-1">DIOSE</div>
            <div className="text-[11px] text-gray-400 tracking-[0.04em]">Ciudad Juárez, Chihuahua</div>
          </div>
          <a
            href="https://maps.google.com/?q=Ciudad+Juárez,Chihuahua"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-5 right-5 bg-white border border-diose-border px-4 py-2 flex items-center gap-2 cursor-pointer"
          >
            <PinIcon size={13} color="#333" />
            <span className="text-xs text-gray-700 tracking-[0.04em]">Ver en Google Maps</span>
          </a>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
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
