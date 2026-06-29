"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroSlide } from "@/lib/data";
import HeroSlideLayer from "@/components/HeroSlideLayer";
import HeroTitle from "@/components/HeroTitle";

type Settings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTitleHighlightColor: string;
  heroSubtitle: string;
  heroCta1Label: string;
  heroCta1Link: string;
  heroCta2Label: string;
  heroCta2Link: string;
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

function newSlide(url: string): HeroSlide {
  return { url, focusX: 50, focusY: 42, zoom: 100, overlay: 100, gradient: "left" };
}

export default function SettingsManager({
  settings,
  heroSlides: initialHeroSlides,
  promos,
}: {
  settings: Settings;
  heroSlides: HeroSlide[];
  promos: Promo[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);
  const [selectedSlide, setSelectedSlide] = useState(0);
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
      setHeroSlides((slides) => {
        const next = [...slides, ...uploaded.map(newSlide)];
        setSelectedSlide(slides.length);
        return next;
      });
    } finally {
      setUploadingHero(false);
    }
  }

  function removeHeroSlide(index: number) {
    setHeroSlides((slides) => slides.filter((_, i) => i !== index));
    setSelectedSlide((s) => Math.max(0, Math.min(s, heroSlides.length - 2)));
  }

  function updateHeroSlide(index: number, patch: Partial<HeroSlide>) {
    setHeroSlides((slides) => slides.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, heroSlides }),
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

        {/* HERO TEXT */}
        <div className="bg-white border border-diose-border p-6">
          <div className="font-heading text-lg text-diose-black mb-1">Texto del banner principal</div>
          <div className="text-xs text-gray-400 mb-5">El título grande, la frase de arriba, el párrafo y los dos botones de la portada.</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Frase pequeña (arriba)</span>
              <input
                value={form.heroEyebrow}
                onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })}
                className="border border-diose-border px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                Título grande (un salto de línea = una línea nueva en el banner)
              </span>
              <textarea
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                rows={3}
                className="border border-diose-border px-3 py-2 text-sm outline-none resize-none"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                Palabra o frase a resaltar de color (debe estar escrita igual dentro del título de arriba)
              </span>
              <div className="flex gap-2 items-stretch">
                <input
                  value={form.heroTitleHighlight}
                  onChange={(e) => setForm({ ...form, heroTitleHighlight: e.target.value })}
                  placeholder="Ej: LO QUE"
                  className="border border-diose-border px-3 py-2 text-sm outline-none flex-1"
                />
                <input
                  type="color"
                  value={form.heroTitleHighlightColor}
                  onChange={(e) => setForm({ ...form, heroTitleHighlightColor: e.target.value })}
                  className="w-11 border border-diose-border cursor-pointer"
                  title="Color del resaltado"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Párrafo</span>
              <input
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                className="border border-diose-border px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>

          <div className="border-t border-diose-border-light mt-5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                Botón 1 (blanco, izquierda)
              </span>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Texto del botón</span>
                <input
                  value={form.heroCta1Label}
                  onChange={(e) => setForm({ ...form, heroCta1Label: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">A dónde lleva al hacer clic</span>
                <input
                  value={form.heroCta1Link}
                  onChange={(e) => setForm({ ...form, heroCta1Link: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                Botón 2 (con borde, derecha)
              </span>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Texto del botón</span>
                <input
                  value={form.heroCta2Label}
                  onChange={(e) => setForm({ ...form, heroCta2Label: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">A dónde lleva al hacer clic</span>
                <input
                  value={form.heroCta2Link}
                  onChange={(e) => setForm({ ...form, heroCta2Link: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
            </div>
          </div>
        </div>

        {/* HERO BANNER IMAGES */}
        <div className="bg-white border border-diose-border p-6">
          <div className="font-heading text-lg text-diose-black mb-1">Imágenes del banner principal</div>
          <div className="text-xs text-gray-400 mb-5">
            Sube varias imágenes — rotan cada 4 segundos en la portada. Selecciona una abajo para ajustar cómo se ve;
            la vista previa muestra exactamente cómo se verá en el sitio. Si no subes ninguna, se usa la imagen por
            defecto.
          </div>

          {heroSlides.length > 0 && (
            <>
              {/* LIVE PREVIEW */}
              <div className="relative w-full aspect-[3/4] md:aspect-[29/10] bg-diose-black overflow-hidden mb-4">
                <HeroSlideLayer slide={heroSlides[selectedSlide] ?? heroSlides[0]} />
                <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10 max-w-md">
                  <div className="w-8 h-0.5 bg-diose-amber mb-2" />
                  <div
                    className="text-[8px] md:text-[10px] text-white/80 tracking-[0.18em] uppercase mb-1.5"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
                  >
                    {form.heroEyebrow}
                  </div>
                  <HeroTitle
                    title={form.heroTitle}
                    highlight={form.heroTitleHighlight}
                    highlightColor={form.heroTitleHighlightColor}
                    className="font-heading text-white text-2xl md:text-[40px] leading-[0.92] tracking-[0.02em]"
                  />
                  <p
                    className="hidden md:block text-[12px] text-white/80 font-light mt-2 max-w-xs leading-relaxed"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
                  >
                    {form.heroSubtitle}
                  </p>
                </div>
              </div>

              {/* PER-SLIDE CONTROLS */}
              {heroSlides[selectedSlide] && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.08em] text-gray-400">
                      Posición horizontal ({heroSlides[selectedSlide].focusX}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={heroSlides[selectedSlide].focusX}
                      onChange={(e) => updateHeroSlide(selectedSlide, { focusX: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.08em] text-gray-400">
                      Posición vertical ({heroSlides[selectedSlide].focusY}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={heroSlides[selectedSlide].focusY}
                      onChange={(e) => updateHeroSlide(selectedSlide, { focusY: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.08em] text-gray-400">
                      Zoom ({heroSlides[selectedSlide].zoom}%)
                    </span>
                    <input
                      type="range"
                      min={100}
                      max={200}
                      value={heroSlides[selectedSlide].zoom}
                      onChange={(e) => updateHeroSlide(selectedSlide, { zoom: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.08em] text-gray-400">
                      Oscurecido ({heroSlides[selectedSlide].overlay}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={heroSlides[selectedSlide].overlay}
                      onChange={(e) => updateHeroSlide(selectedSlide, { overlay: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1 col-span-2 sm:col-span-4">
                    <span className="text-[9px] uppercase tracking-[0.08em] text-gray-400">Tipo de degradado</span>
                    <select
                      value={heroSlides[selectedSlide].gradient}
                      onChange={(e) => updateHeroSlide(selectedSlide, { gradient: e.target.value as HeroSlide["gradient"] })}
                      className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="left">Izquierda a derecha (clásico, texto a la izquierda)</option>
                      <option value="bottom">De arriba a abajo (oscuro abajo)</option>
                      <option value="top">De abajo a arriba (oscuro arriba)</option>
                      <option value="flat">Oscurecido uniforme (sin degradado)</option>
                    </select>
                  </label>
                </div>
              )}
            </>
          )}

          {/* THUMBNAIL STRIP */}
          <div className="flex flex-wrap gap-2.5">
            {heroSlides.map((slide, i) => (
              <div
                key={slide.url + i}
                onClick={() => setSelectedSlide(i)}
                className={`relative w-20 h-14 shrink-0 overflow-hidden cursor-pointer border-2 ${
                  i === selectedSlide ? "border-diose-amber" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeHeroSlide(i);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-diose-black text-white text-[9px] flex items-center justify-center cursor-pointer rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="w-20 h-14 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-[10px] shrink-0 hover:border-diose-amber text-center">
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
