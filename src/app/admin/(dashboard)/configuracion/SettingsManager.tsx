"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { HeroSlide } from "@/lib/data";
import HeroSlideLayer from "@/components/HeroSlideLayer";
import HeroTitle from "@/components/HeroTitle";
import ConfirmModal from "@/components/ConfirmModal";
import { useToastStore } from "@/store/toastStore";

type CatalogItem = { id: string; name: string; count: number };

function CatalogSection({
  title,
  description,
  endpoint,
  namePlaceholder,
}: {
  title: string;
  description: string;
  endpoint: string;
  namePlaceholder: string;
}) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmItem, setConfirmItem] = useState<CatalogItem | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(endpoint);
    setItems(await res.json());
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setNewName("");
      await load();
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    setConfirmItem(null);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    await load();
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setEditId(null);
      await load();
    } finally { setSaving(false); }
  }

  return (
    <>
      {confirmItem && (
        <ConfirmModal
          message={`¿Eliminar "${confirmItem.name}"?`}
          onConfirm={() => { const id = confirmItem.id; setConfirmItem(null); remove(id); }}
          onCancel={() => setConfirmItem(null)}
        />
      )}
    <div className="bg-white border border-diose-border p-6">
      <div className="font-heading text-lg text-diose-black mb-1">{title}</div>
      <div className="text-xs text-gray-400 mb-5">{description}</div>

      <div className="flex flex-col gap-1.5 mb-5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 border border-diose-border-light px-3 py-2">
            {editId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditId(null); }}
                  className="flex-1 text-sm outline-none border-b border-diose-amber"
                  autoFocus
                />
                <button onClick={() => saveEdit(item.id)} disabled={saving} className="text-[11px] text-diose-amber font-semibold cursor-pointer">
                  Guardar
                </button>
                <button onClick={() => setEditId(null)} className="text-[11px] text-gray-400 cursor-pointer">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-diose-black">{item.name}</span>
                <span className="text-[11px] text-gray-400">{item.count} productos</span>
                <button
                  onClick={() => { setEditId(item.id); setEditName(item.name); setError(""); }}
                  className="text-[11px] text-gray-500 hover:text-diose-black cursor-pointer ml-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => setConfirmItem(item)}
                  disabled={item.count > 0}
                  title={item.count > 0 ? "Reasigna o elimina los productos primero" : "Eliminar"}
                  className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="text-xs text-gray-400">Sin registros aún.</div>}
      </div>

      {error && <div className="text-xs text-red-500 mb-3">{error}</div>}

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") create(); }}
          placeholder={namePlaceholder}
          className="flex-1 border border-diose-border px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={create}
          disabled={saving || !newName.trim()}
          className="bg-diose-black hover:bg-diose-amber text-white px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
        >
          {saving ? "..." : "Agregar"}
        </button>
      </div>
    </div>
    </>
  );
}

function SubcategorySection() {
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmItem, setConfirmItem] = useState<CatalogItem | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/categories");
      const data: CatalogItem[] = await res.json();
      setCategories(data);
      setCategoryId((prev) => prev || data[0]?.id || "");
    })();
  }, []);

  const load = useCallback(async () => {
    if (!categoryId) {
      setItems([]);
      return;
    }
    const res = await fetch(`/api/subcategories?categoryId=${categoryId}`);
    setItems(await res.json());
  }, [categoryId]);

  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!newName.trim() || !categoryId) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, categoryId }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setNewName("");
      await load();
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
    setConfirmItem(null);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    await load();
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/subcategories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setEditId(null);
      await load();
    } finally { setSaving(false); }
  }

  return (
    <>
      {confirmItem && (
        <ConfirmModal
          message={`¿Eliminar "${confirmItem.name}"?`}
          onConfirm={() => { const id = confirmItem.id; setConfirmItem(null); remove(id); }}
          onCancel={() => setConfirmItem(null)}
        />
      )}
      <div className="bg-white border border-diose-border p-6">
        <div className="font-heading text-lg text-diose-black mb-1">Subcategorías</div>
        <div className="text-xs text-gray-400 mb-5">
          Divide una categoría en tipos más específicos — por ejemplo, dentro de &quot;Tornillería&quot;: Grado 5,
          Grado 8, Socket, Rondanas, Tuercas. Elige primero la categoría, luego administra sus subcategorías.
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-diose-border px-3 py-2 text-sm outline-none bg-white mb-4 w-full"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {categoryId && (
          <>
            <div className="flex flex-col gap-1.5 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 border border-diose-border-light px-3 py-2">
                  {editId === item.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditId(null); }}
                        className="flex-1 text-sm outline-none border-b border-diose-amber"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(item.id)} disabled={saving} className="text-[11px] text-diose-amber font-semibold cursor-pointer">
                        Guardar
                      </button>
                      <button onClick={() => setEditId(null)} className="text-[11px] text-gray-400 cursor-pointer">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-diose-black">{item.name}</span>
                      <span className="text-[11px] text-gray-400">{item.count} productos</span>
                      <button
                        onClick={() => { setEditId(item.id); setEditName(item.name); setError(""); }}
                        className="text-[11px] text-gray-500 hover:text-diose-black cursor-pointer ml-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmItem(item)}
                        disabled={item.count > 0}
                        title={item.count > 0 ? "Reasigna o elimina los productos primero" : "Eliminar"}
                        className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              ))}
              {items.length === 0 && <div className="text-xs text-gray-400">Sin subcategorías en esta categoría aún.</div>}
            </div>

            {error && <div className="text-xs text-red-500 mb-3">{error}</div>}

            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") create(); }}
                placeholder="Ej: Grado 8"
                className="flex-1 border border-diose-border px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={create}
                disabled={saving || !newName.trim()}
                className="bg-diose-black hover:bg-diose-amber text-white px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
              >
                {saving ? "..." : "Agregar"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

type Settings = {
  phone: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTitleHighlightColor: string;
  heroSubtitle: string;
  heroCta1Label: string;
  heroCta1Link: string;
  heroCta2Label: string;
  heroCta2Link: string;
  partnerLogoUrl: string;
  partnerName: string;
  aboutEyebrow: string;
  aboutHeroLine1: string;
  aboutHeroLine2: string;
  aboutHeroLine3: string;
  aboutFoundedYear: string;
  aboutHistoryP1: string;
  aboutHistoryP2: string;
  aboutFeature1: string;
  aboutFeature2: string;
  aboutFeature3: string;
  aboutCityLine: string;
  aboutStateLine: string;
  announcementText: string;
  announcementBgColor: string;
  announcementTextColor: string;
  announcementFontSize: number;
  announcementSpeed: number;
  announcementFontFamily: string;
};

type Promo = {
  id: string;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  title: string | null;
  subtitle: string | null;
  badgeText: string | null;
  sectionLabel: string | null;
  link: string | null;
  linkedProductId?: string | null;
  linkedProduct?: { id: string; name: string; brand: string; price: number; images?: string[] } | null;
};

type PickableProduct = { id: string; name: string; brand: string; price: number; images?: string[] };

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

const TABS = [
  { key: "contacto", label: "Contacto" },
  { key: "portada", label: "Portada" },
  { key: "nosotros", label: "Nosotros" },
  { key: "publicidad", label: "Publicidad" },
  { key: "catalogo", label: "Catálogo" },
  { key: "promos", label: "Promociones" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

const inputCls = "border border-diose-border px-3 py-2 text-sm outline-none focus:border-diose-amber transition-colors";

export default function SettingsManager({
  settings,
  heroSlides: initialHeroSlides,
  promos,
  sectionLabels,
  products,
}: {
  settings: Settings;
  heroSlides: HeroSlide[];
  promos: Promo[];
  sectionLabels: string[];
  products: PickableProduct[];
}) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const [tab, setTab] = useState<TabKey>("contacto");
  const [form, setForm] = useState(settings);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [promoForm, setPromoForm] = useState({
    imageUrl: "",
    mediaType: "IMAGE" as "IMAGE" | "VIDEO",
    title: "",
    subtitle: "",
    badgeText: "",
    sectionLabel: "",
    link: "",
    linkedProductId: "",
  });
  const [productSearch, setProductSearch] = useState("");
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [uploadingPartnerLogo, setUploadingPartnerLogo] = useState(false);

  function setField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handlePartnerLogoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingPartnerLogo(true);
    try {
      const url = await uploadImage(files[0]);
      setField("partnerLogoUrl", url);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo subir la imagen.", "error");
    } finally {
      setUploadingPartnerLogo(false);
    }
  }

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
      setDirty(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo subir alguna imagen.", "error");
    } finally {
      setUploadingHero(false);
    }
  }

  function removeHeroSlide(index: number) {
    setHeroSlides((slides) => slides.filter((_, i) => i !== index));
    setSelectedSlide((s) => Math.max(0, Math.min(s, heroSlides.length - 2)));
    setDirty(true);
  }

  function updateHeroSlide(index: number, patch: Partial<HeroSlide>) {
    setHeroSlides((slides) => slides.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    setDirty(true);
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, heroSlides }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "No se pudo guardar la configuración.", "error");
        return;
      }
      setSavedMsg(true);
      setDirty(false);
      setTimeout(() => setSavedMsg(false), 2500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handlePromoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const isVideo = file.type.startsWith("video/");
    setUploadingPromo(true);
    try {
      const url = await uploadImage(file);
      setPromoForm((f) => ({ ...f, imageUrl: url, mediaType: isVideo ? "VIDEO" : "IMAGE" }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo subir el archivo.", "error");
    } finally {
      setUploadingPromo(false);
    }
  }

  async function createPromo() {
    if (!promoForm.imageUrl) return;
    setCreatingPromo(true);
    try {
      const res = await fetch("/api/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: promoForm.imageUrl,
          mediaType: promoForm.mediaType,
          title: promoForm.title || undefined,
          subtitle: promoForm.subtitle || undefined,
          badgeText: promoForm.badgeText || undefined,
          sectionLabel: promoForm.sectionLabel || undefined,
          link: promoForm.link || undefined,
          linkedProductId: promoForm.linkedProductId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "No se pudo agregar la promoción.", "error");
        return;
      }
      setPromoForm({ imageUrl: "", mediaType: "IMAGE", title: "", subtitle: "", badgeText: "", sectionLabel: "", link: "", linkedProductId: "" });
      setProductSearch("");
      router.refresh();
    } finally {
      setCreatingPromo(false);
    }
  }

  const [confirmPromoId, setConfirmPromoId] = useState<string | null>(null);

  async function removePromo(id: string) {
    const res = await fetch(`/api/promos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("No se pudo eliminar la promoción.", "error");
      return;
    }
    router.refresh();
  }

  const formTabs: TabKey[] = ["contacto", "portada", "nosotros", "publicidad", "promos"];
  const showGlobalSave = formTabs.includes(tab);

  return (
    <>
      {/* TOP BAR: title + tabs + sticky save */}
      <div className="bg-white border-b border-diose-border-light shrink-0 sticky top-0 z-20">
        <div className="h-14 flex items-center justify-between px-9">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Configuración</span>
          {showGlobalSave && (
            <div className="flex items-center gap-3">
              {savedMsg && <span className="text-xs text-diose-success">Cambios guardados ✓</span>}
              {dirty && !savedMsg && <span className="text-xs text-gray-400">Cambios sin guardar</span>}
              <button
                onClick={saveSettings}
                disabled={saving || !dirty}
                className="bg-diose-amber hover:bg-diose-amber-dark text-white px-6 py-2.5 text-xs font-semibold tracking-[0.08em] cursor-pointer disabled:opacity-40 transition-colors"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-1 px-9 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-[12px] font-semibold tracking-[0.04em] whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                tab === t.key
                  ? "border-diose-amber text-diose-black"
                  : "border-transparent text-gray-400 hover:text-diose-black"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-9 flex flex-col gap-7 max-w-3xl">
        {/* CONTACTO */}
        {tab === "contacto" && (
          <div className="bg-white border border-diose-border p-6">
            <div className="font-heading text-lg text-diose-black mb-1">Datos de contacto</div>
            <div className="text-xs text-gray-400 mb-5">
              Se usan en el menú, pie de página, página de contacto y botones de WhatsApp en todo el sitio.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Teléfono (texto mostrado)">
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+52 (656) 123-4567"
                  className={inputCls}
                />
              </Field>
              <Field label="Teléfono secundario (opcional)">
                <input
                  value={form.phone2}
                  onChange={(e) => setField("phone2", e.target.value)}
                  placeholder="(656) 660-46-52"
                  className={inputCls}
                />
              </Field>
              <Field label="WhatsApp (solo números, con código de país)">
                <input
                  value={form.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value.replace(/\D/g, ""))}
                  placeholder="526561234567"
                  className={inputCls}
                />
              </Field>
              <Field label="Correo">
                <input value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Dirección">
                  <input value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Enlace de Google Maps de tu negocio (opcional)"
                  hint='Acepta ambos formatos: el enlace simple o el código <iframe> de "Insertar un mapa" (el segundo es más preciso). Si lo dejas vacío, el mapa usa la dirección de arriba.'
                >
                  <textarea
                    value={form.mapsUrl}
                    onChange={(e) => setField("mapsUrl", e.target.value)}
                    placeholder="Pega aquí el enlace de Compartir → Copiar enlace, o el código completo de Compartir → Insertar un mapa"
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* PORTADA */}
        {tab === "portada" && (
          <>
            <div className="bg-white border border-diose-border p-6">
              <div className="font-heading text-lg text-diose-black mb-1">Texto del banner principal</div>
              <div className="text-xs text-gray-400 mb-5">El título grande, la frase de arriba, el párrafo y los dos botones de la portada.</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Frase pequeña (arriba)">
                    <input value={form.heroEyebrow} onChange={(e) => setField("heroEyebrow", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Título grande (un salto de línea = una línea nueva en el banner)">
                    <textarea
                      value={form.heroTitle}
                      onChange={(e) => setField("heroTitle", e.target.value)}
                      rows={3}
                      className={`${inputCls} resize-none`}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Palabra o frase a resaltar de color (debe estar escrita igual dentro del título de arriba)">
                    <div className="flex gap-2 items-stretch">
                      <input
                        value={form.heroTitleHighlight}
                        onChange={(e) => setField("heroTitleHighlight", e.target.value)}
                        placeholder="Ej: LO QUE"
                        className={`${inputCls} flex-1`}
                      />
                      <input
                        type="color"
                        value={form.heroTitleHighlightColor}
                        onChange={(e) => setField("heroTitleHighlightColor", e.target.value)}
                        className="w-11 border border-diose-border cursor-pointer"
                        title="Color del resaltado"
                      />
                    </div>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Párrafo">
                    <input value={form.heroSubtitle} onChange={(e) => setField("heroSubtitle", e.target.value)} className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="border-t border-diose-border-light mt-5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                    Botón 1 (blanco, izquierda)
                  </span>
                  <Field label="Texto del botón">
                    <input value={form.heroCta1Label} onChange={(e) => setField("heroCta1Label", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="A dónde lleva al hacer clic">
                    <input value={form.heroCta1Link} onChange={(e) => setField("heroCta1Link", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                    Botón 2 (con borde, derecha)
                  </span>
                  <Field label="Texto del botón">
                    <input value={form.heroCta2Label} onChange={(e) => setField("heroCta2Label", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="A dónde lleva al hacer clic">
                    <input value={form.heroCta2Link} onChange={(e) => setField("heroCta2Link", e.target.value)} className={inputCls} />
                  </Field>
                </div>
              </div>
            </div>

            {/* HERO BANNER IMAGES */}
            <div className="bg-white border border-diose-border p-6">
              <div className="font-heading text-lg text-diose-black mb-1">Imágenes del banner principal</div>
              <div className="text-xs text-gray-400 mb-5">
                Sube varias imágenes — rotan cada 4 segundos en la portada. Selecciona una abajo para ajustar cómo se
                ve; la vista previa muestra exactamente cómo se verá en el sitio. Si no subes ninguna, se usa la
                imagen por defecto.
              </div>

              {heroSlides.length > 0 && (
                <>
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
          </>
        )}

        {/* NOSOTROS */}
        {tab === "nosotros" && (
          <div className="bg-white border border-diose-border p-6">
            <div className="font-heading text-lg text-diose-black mb-1">Página &quot;Nosotros&quot;</div>
            <div className="text-xs text-gray-400 mb-5">
              Edita el contenido de la página /nosotros: el encabezado oscuro, la historia, los puntos destacados y
              las métricas.
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-3">Encabezado</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <Field label="Frase pequeña (arriba, en gris)">
                  <input value={form.aboutEyebrow} onChange={(e) => setField("aboutEyebrow", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label="Título — línea 1">
                <input value={form.aboutHeroLine1} onChange={(e) => setField("aboutHeroLine1", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Título — línea 2 (se muestra atenuada)">
                <input value={form.aboutHeroLine2} onChange={(e) => setField("aboutHeroLine2", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Título — línea 3">
                <input value={form.aboutHeroLine3} onChange={(e) => setField("aboutHeroLine3", e.target.value)} className={inputCls} />
              </Field>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-3">Historia</div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Field label="Año de fundación (se muestra en la métrica grande)">
                <input
                  value={form.aboutFoundedYear}
                  onChange={(e) => setField("aboutFoundedYear", e.target.value)}
                  className={`${inputCls} max-w-[160px]`}
                />
              </Field>
              <Field label="Párrafo 1 (oscuro)">
                <textarea
                  value={form.aboutHistoryP1}
                  onChange={(e) => setField("aboutHistoryP1", e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <Field label="Párrafo 2 (gris)">
                <textarea
                  value={form.aboutHistoryP2}
                  onChange={(e) => setField("aboutHistoryP2", e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-3">
              Puntos destacados (3 íconos con check)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Field label="Punto 1">
                <input value={form.aboutFeature1} onChange={(e) => setField("aboutFeature1", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Punto 2">
                <input value={form.aboutFeature2} onChange={(e) => setField("aboutFeature2", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Punto 3">
                <input value={form.aboutFeature3} onChange={(e) => setField("aboutFeature3", e.target.value)} className={inputCls} />
              </Field>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-3">
              Ubicación (última tarjeta de métricas)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ciudad">
                <input value={form.aboutCityLine} onChange={(e) => setField("aboutCityLine", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Estado / país">
                <input value={form.aboutStateLine} onChange={(e) => setField("aboutStateLine", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        )}

        {/* PUBLICIDAD */}
        {tab === "publicidad" && (
          <div className="bg-white border border-diose-border p-6">
            <div className="font-heading text-lg text-diose-black mb-1">Logo de socio (para publicidad)</div>
            <div className="text-xs text-gray-400 mb-5">
              Si trabajas publicidad junto con otro negocio (por ejemplo un proveedor), súbelo aquí una vez. Luego, al
              crear un post en Admin → Publicidad, puedes activarlo o desactivarlo para ese post.
            </div>
            <div className="flex items-center gap-4">
              {form.partnerLogoUrl ? (
                <div className="relative w-20 h-20 border border-diose-border-light shrink-0 flex items-center justify-center bg-[#FAFAFA]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.partnerLogoUrl} alt="" className="max-w-full max-h-full object-contain" />
                  <button
                    onClick={() => setField("partnerLogoUrl", "")}
                    className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-diose-black text-white text-[10px] flex items-center justify-center cursor-pointer rounded-full"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="w-20 h-20 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-[10px] shrink-0 hover:border-diose-amber text-center">
                  {uploadingPartnerLogo ? "..." : "+ Subir"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPartnerLogo}
                    onChange={(e) => handlePartnerLogoUpload(e.target.files)}
                  />
                </label>
              )}
              <Field label="Nombre del socio">
                <input
                  value={form.partnerName}
                  onChange={(e) => setField("partnerName", e.target.value)}
                  placeholder="Ej: Tornillos y Remaches Horus"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        )}

        {/* CATALOGO */}
        {tab === "catalogo" && (
          <>
            <div className="text-xs text-gray-400 -mb-2">Estos cambios se guardan al instante, no necesitan el botón de arriba.</div>
            <CatalogSection
              title="Marcas"
              description="Las marcas que aparecen al agregar o editar productos. Puedes agregar, renombrar o eliminar (solo si no tienen productos asignados)."
              endpoint="/api/brands"
              namePlaceholder="Ej: TRUPER"
            />
            <CatalogSection
              title="Categorías"
              description="Las categorías del catálogo. Puedes agregar, renombrar o eliminar (solo si no tienen productos asignados)."
              endpoint="/api/categories"
              namePlaceholder="Ej: Herramientas"
            />
            <SubcategorySection />
          </>
        )}

        {/* PROMOS */}
        {tab === "promos" && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-diose-border p-6">
              <div className="font-heading text-lg text-diose-black mb-1">Letrero animado (arriba de todo el sitio)</div>
              <div className="text-xs text-gray-400 mb-4">
                Texto que se desliza como un letrero movible en la parte superior de cada página pública. Déjalo
                vacío para ocultarlo.
              </div>
              <input
                value={form.announcementText}
                onChange={(e) => setField("announcementText", e.target.value)}
                placeholder="Ej: Envíos a todo Ciudad Juárez · Cotiza por WhatsApp · Materiales con garantía"
                className={`${inputCls} w-full mb-4`}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <Field label="Color de fondo">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.announcementBgColor}
                      onChange={(e) => setField("announcementBgColor", e.target.value)}
                      className="w-9 h-9 border border-diose-border cursor-pointer shrink-0"
                    />
                    <input
                      value={form.announcementBgColor}
                      onChange={(e) => setField("announcementBgColor", e.target.value)}
                      className={`${inputCls} w-full`}
                    />
                  </div>
                </Field>
                <Field label="Color del texto">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.announcementTextColor}
                      onChange={(e) => setField("announcementTextColor", e.target.value)}
                      className="w-9 h-9 border border-diose-border cursor-pointer shrink-0"
                    />
                    <input
                      value={form.announcementTextColor}
                      onChange={(e) => setField("announcementTextColor", e.target.value)}
                      className={`${inputCls} w-full`}
                    />
                  </div>
                </Field>
                <Field label={`Tamaño de letra: ${form.announcementFontSize}px`}>
                  <input
                    type="range"
                    min={10}
                    max={20}
                    value={form.announcementFontSize}
                    onChange={(e) => setField("announcementFontSize", Number(e.target.value))}
                    className="w-full accent-diose-amber cursor-pointer"
                  />
                </Field>
                <Field label={`Velocidad: ${form.announcementSpeed}s por vuelta`}>
                  <input
                    type="range"
                    min={8}
                    max={60}
                    value={form.announcementSpeed}
                    onChange={(e) => setField("announcementSpeed", Number(e.target.value))}
                    className="w-full accent-diose-amber cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400">Menos = más rápido</span>
                </Field>
              </div>

              <Field label="Tipografía">
                <div className="flex gap-2">
                  {(["sans", "heading"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setField("announcementFontFamily", f)}
                      className={`px-4 py-2 text-xs font-semibold cursor-pointer border transition-colors ${
                        form.announcementFontFamily === f
                          ? "bg-diose-black text-white border-diose-black"
                          : "border-diose-border text-gray-600 hover:border-diose-black"
                      }`}
                    >
                      {f === "sans" ? "Regular (Outfit)" : "Impacto (Bebas Neue)"}
                    </button>
                  ))}
                </div>
              </Field>

              {form.announcementText.trim() && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mb-1.5">Vista previa</div>
                  <div
                    className="overflow-hidden whitespace-nowrap select-none border border-diose-border-light"
                    style={{ background: form.announcementBgColor }}
                  >
                    <div
                      className="py-1.5 px-4 font-semibold tracking-[0.04em] truncate"
                      style={{
                        color: form.announcementTextColor,
                        fontSize: `${form.announcementFontSize}px`,
                        fontFamily:
                          form.announcementFontFamily === "heading" ? "var(--font-heading)" : "var(--font-sans)",
                      }}
                    >
                      {form.announcementText}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-diose-border p-6">
              <div className="font-heading text-lg text-diose-black mb-1">Ofertas y promociones (inicio)</div>
              <div className="text-xs text-gray-400 mb-2">
                Tarjetas de promoción que aparecen en la página de inicio, debajo de los productos destacados. Se
                guardan al instante.
              </div>
              <div className="text-xs text-gray-400 mb-5 bg-diose-gray border border-diose-border-light px-3 py-2.5">
                <span className="font-semibold text-diose-black">Medidas recomendadas: </span>
                imágenes cuadradas de <span className="font-medium text-diose-black">1000 × 1000 px</span> (máx.
                8 MB, formato JPG/WEBP). Para video: clips cortos y silenciosos de{" "}
                <span className="font-medium text-diose-black">1000 × 1000 px</span> (o 1:1), de 5–10 segundos, en
                MP4, máx. 25 MB — se reproducen en bucle automáticamente sin sonido.
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                {promos.map((p) => (
                  <div key={p.id} className="relative w-32 border border-diose-border-light">
                    <div className="w-full h-24 overflow-hidden bg-diose-black">
                      {p.mediaType === "VIDEO" ? (
                        <video src={p.imageUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    {p.sectionLabel && (
                      <div className="text-[9px] font-semibold uppercase tracking-[0.06em] text-diose-amber px-2 pt-1.5 truncate">
                        {p.sectionLabel}
                      </div>
                    )}
                    {p.title && <div className="text-[11px] font-medium text-diose-black px-2 pt-0.5 truncate">{p.title}</div>}
                    {p.badgeText && <div className="text-[10px] text-gray-400 px-2 pb-1.5 truncate">{p.badgeText}</div>}
                    {p.linkedProduct && (
                      <div className="text-[9px] text-diose-success font-medium px-2 pb-1.5 truncate">
                        Vinculado: {p.linkedProduct.name}
                      </div>
                    )}
                    <button
                      onClick={() => setConfirmPromoId(p.id)}
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
                    <div className="relative w-24 h-20 border border-diose-border-light overflow-hidden shrink-0 bg-diose-black">
                      {promoForm.mediaType === "VIDEO" ? (
                        <video src={promoForm.imageUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={promoForm.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <label className="w-24 h-20 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-xs shrink-0 hover:border-diose-amber text-center px-1">
                      {uploadingPromo ? "..." : "+ Imagen / video"}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        disabled={uploadingPromo}
                        onChange={(e) => handlePromoUpload(e.target.files)}
                      />
                    </label>
                  )}
                  <div className="flex flex-col gap-2 flex-1 min-w-[220px]">
                    <input
                      value={promoForm.sectionLabel}
                      onChange={(e) => setPromoForm((f) => ({ ...f, sectionLabel: e.target.value }))}
                      placeholder="Nombre de la sección (opcional), ej: HERRAMIENTAS CON OFERTA"
                      list="promo-section-labels"
                      className="border border-diose-border px-3 py-2 text-sm outline-none"
                    />
                    <datalist id="promo-section-labels">
                      {sectionLabels.map((label) => (
                        <option key={label} value={label} />
                      ))}
                    </datalist>
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
                      value={promoForm.badgeText}
                      onChange={(e) => setPromoForm((f) => ({ ...f, badgeText: e.target.value }))}
                      placeholder="Etiqueta de ahorro (opcional), ej: Hasta 35% de ahorro"
                      className="border border-diose-border px-3 py-2 text-sm outline-none"
                    />
                    <input
                      value={promoForm.link}
                      onChange={(e) => setPromoForm((f) => ({ ...f, link: e.target.value }))}
                      placeholder="Enlace al hacer clic, ej: /catalogo o /catalogo?categoria=NOMBRE DE LA CATEGORÍA"
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

                <div className="mt-4 border border-diose-border-light p-3.5">
                  <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">
                    Vincular a un producto (opcional)
                  </div>
                  <div className="text-[11px] text-gray-400 mb-3">
                    Si eliges un producto, esta promoción se muestra como banner ancho: la imagen a un lado y el
                    producto con botón de &quot;Añadir al carrito&quot; al otro. Ideal para ofertas de un producto específico.
                  </div>
                  {promoForm.linkedProductId ? (
                    (() => {
                      const chosen = products.find((p) => p.id === promoForm.linkedProductId);
                      if (!chosen) return null;
                      return (
                        <div className="flex items-center gap-3 bg-diose-gray px-3 py-2">
                          <div className="w-9 h-9 bg-white border border-diose-border-light shrink-0 overflow-hidden">
                            {chosen.images?.[0] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={chosen.images[0]} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-diose-black truncate">{chosen.name}</div>
                            <div className="text-[11px] text-gray-400">
                              {chosen.brand} · ${chosen.price.toLocaleString("es-MX")}
                            </div>
                          </div>
                          <button
                            onClick={() => setPromoForm((f) => ({ ...f, linkedProductId: "" }))}
                            className="text-[11px] text-diose-danger hover:underline cursor-pointer shrink-0"
                          >
                            Quitar
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <>
                      <input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar producto por nombre o marca..."
                        className="border border-diose-border px-3 py-2 text-sm outline-none w-full mb-2"
                      />
                      {productSearch.trim() && (
                        <div className="max-h-40 overflow-y-auto border border-diose-border-light">
                          {products
                            .filter(
                              (p) =>
                                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                p.brand.toLowerCase().includes(productSearch.toLowerCase())
                            )
                            .slice(0, 8)
                            .map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setPromoForm((f) => ({ ...f, linkedProductId: p.id }));
                                  setProductSearch("");
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-left border-b border-diose-border-light last:border-b-0"
                              >
                                <div className="w-7 h-7 bg-[#F0F0F0] shrink-0 overflow-hidden">
                                  {p.images?.[0] && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-medium text-diose-black truncate">{p.name}</div>
                                  <div className="text-[10px] text-gray-400">
                                    {p.brand} · ${p.price.toLocaleString("es-MX")}
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="text-[11px] text-gray-400 mt-3">
                  Consejo: usa el mismo nombre de sección en varias promociones para agruparlas bajo un mismo
                  encabezado tipo &quot;cinta de precaución&quot; en la página de inicio.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {confirmPromoId && (
        <ConfirmModal
          message="¿Eliminar esta promoción?"
          onConfirm={() => { const id = confirmPromoId; setConfirmPromoId(null); removePromo(id); }}
          onCancel={() => setConfirmPromoId(null)}
        />
      )}
    </>
  );
}
