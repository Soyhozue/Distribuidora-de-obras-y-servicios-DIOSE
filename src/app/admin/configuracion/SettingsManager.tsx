"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  heroImages: string[];
};

type Promo = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
};

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) throw new Error("Error al subir la imagen");
  const data = await res.json();
  return data.url as string;
}

export default function SettingsManager({ settings, promos }: { settings: Settings; promos: Promo[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
  });
  const [heroImages, setHeroImages] = useState(settings.heroImages);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const [promoForm, setPromoForm] = useState({ imageUrl: "", title: "", subtitle: "", link: "" });
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [creatingPromo, setCreatingPromo] = useState(false);

  async function handleHeroUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingHero(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadImage));
      setHeroImages((imgs) => [...imgs, ...uploaded]);
    } finally {
      setUploadingHero(false);
    }
  }

  function removeHeroImage(url: string) {
    setHeroImages((imgs) => imgs.filter((i) => i !== url));
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, heroImages }),
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handlePromoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingPromo(true);
    try {
      const url = await uploadImage(files[0]);
      setPromoForm((f) => ({ ...f, imageUrl: url }));
    } finally {
      setUploadingPromo(false);
    }
  }

  async function createPromo() {
    if (!promoForm.imageUrl) return;
    setCreatingPromo(true);
    try {
      await fetch("/api/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: promoForm.imageUrl,
          title: promoForm.title || undefined,
          subtitle: promoForm.subtitle || undefined,
          link: promoForm.link || undefined,
        }),
      });
      setPromoForm({ imageUrl: "", title: "", subtitle: "", link: "" });
      router.refresh();
    } finally {
      setCreatingPromo(false);
    }
  }

  async function removePromo(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    await fetch(`/api/promos/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9 shrink-0">
        <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Configuración</span>
      </div>

      <div className="flex-1 p-9 flex flex-col gap-7 max-w-3xl overflow-y-auto">
        {/* CONTACT INFO */}
        <div className="bg-white border border-diose-border p-6">
          <div className="font-heading text-lg text-diose-black mb-1">Datos de contacto</div>
          <div className="text-xs text-gray-400 mb-5">
            Se usan en el menú, pie de página, página de contacto y botones de WhatsApp en todo el sitio.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Teléfono (texto mostrado)</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+52 (656) 123-4567"
                className="border border-diose-border px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                WhatsApp (solo números, con código de país)
              </span>
              <input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "") })}
                placeholder="526561234567"
                className="border border-diose-border px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Correo</span>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-diose-border px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Dirección</span>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="border border-diose-border px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="bg-white border border-diose-border p-6">
          <div className="font-heading text-lg text-diose-black mb-1">Banner principal (inicio)</div>
          <div className="text-xs text-gray-400 mb-5">
            Sube varias imágenes y se mostrarán rotando cada 4 segundos en la portada. Si no subes ninguna, se usa la
            imagen por defecto.
          </div>
          <div className="flex flex-wrap gap-2.5">
            {heroImages.map((url) => (
              <div key={url} className="relative w-28 h-20 border border-diose-border-light shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeHeroImage(url)}
                  className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-diose-black text-white text-[10px] flex items-center justify-center cursor-pointer rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="w-28 h-20 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-xs shrink-0 hover:border-diose-amber">
              {uploadingHero ? "..." : "+ Subir"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingHero}
                onChange={(e) => handleHeroUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-diose-amber hover:bg-diose-amber-dark text-white px-6 py-2.5 text-xs font-semibold tracking-[0.08em] cursor-pointer disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          {savedMsg && <span className="text-xs text-diose-success">Cambios guardados ✓</span>}
        </div>

        {/* PROMOS */}
        <div className="bg-white border border-diose-border p-6">
          <div className="font-heading text-lg text-diose-black mb-1">Ofertas y promociones (inicio)</div>
          <div className="text-xs text-gray-400 mb-5">
            Tarjetas de promoción que aparecen en la página de inicio, debajo de los productos destacados.
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            {promos.map((p) => (
              <div key={p.id} className="relative w-32 border border-diose-border-light">
                <div className="w-full h-24 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                {p.title && <div className="text-[11px] font-medium text-diose-black px-2 pt-1.5 truncate">{p.title}</div>}
                <button
                  onClick={() => removePromo(p.id)}
                  className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-diose-black text-white text-[10px] flex items-center justify-center cursor-pointer rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
            {promos.length === 0 && <div className="text-xs text-gray-400">Aún no hay promociones.</div>}
          </div>

          <div className="border-t border-diose-border-light pt-5">
            <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-3">
              Agregar nueva promoción
            </div>
            <div className="flex flex-wrap gap-3 items-start">
              {promoForm.imageUrl ? (
                <div className="w-24 h-20 border border-diose-border-light overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={promoForm.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="w-24 h-20 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-xs shrink-0 hover:border-diose-amber">
                  {uploadingPromo ? "..." : "+ Imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPromo}
                    onChange={(e) => handlePromoUpload(e.target.files)}
                  />
                </label>
              )}
              <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                <input
                  value={promoForm.title}
                  onChange={(e) => setPromoForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Título (opcional)"
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
                <input
                  value={promoForm.subtitle}
                  onChange={(e) => setPromoForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Subtítulo (opcional)"
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
                <input
                  value={promoForm.link}
                  onChange={(e) => setPromoForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="Enlace al hacer clic, ej: /catalogo?categoria=herramientas"
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </div>
              <button
                onClick={createPromo}
                disabled={creatingPromo || !promoForm.imageUrl}
                className="bg-diose-black hover:bg-diose-amber text-white px-5 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
              >
                {creatingPromo ? "Agregando..." : "Añadir"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
