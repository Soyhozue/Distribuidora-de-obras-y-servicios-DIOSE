"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { WhatsAppIcon } from "@/components/icons";
import type { Product } from "@/data/products";

const POST_TYPE_OPTIONS = [
  { label: "Producto individual", value: "INDIVIDUAL" as const },
  { label: "Combo de productos", value: "COMBO" as const },
  { label: "Oferta / Promoción", value: "OFERTA" as const },
  { label: "Banner informativo", value: "BANNER" as const },
];

const FORMATS = [
  { label: "Cuadrado", value: "square", ratio: "1/1", dims: "1080 × 1080 px", help: "Instagram / Facebook feed" },
  { label: "Historia", value: "story", ratio: "9/16", dims: "1080 × 1920 px", help: "Instagram / Facebook story" },
  { label: "Banner", value: "banner", ratio: "1200/628", dims: "1200 × 628 px", help: "Anuncio web / Facebook ad" },
];

const BACKGROUNDS = [
  { value: "#0A0A0A", label: "Negro" },
  { value: "#0c1f44", label: "Azul oscuro" },
  { value: "#7a0c14", label: "Rojo oscuro" },
  { value: "#ffffff", label: "Blanco" },
];

type AdSettings = {
  phone: string;
  phone2: string;
  address: string;
  whatsapp: string;
  partnerLogoUrl: string;
  partnerName: string;
};

type SavedCombo = {
  id: string;
  title: string;
  subtitle: string | null;
  type: string;
  format: string;
  background: string;
  comboPrice: number | null;
  savings: number | null;
  createdAt: string;
  products: string[];
};

function cityFromAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? `${parts[parts.length - 2]}, ${parts[parts.length - 1]}` : address;
}

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) throw new Error("Error al subir la imagen");
  const data = await res.json();
  return data.url as string;
}

export default function AdsManager({
  products,
  pendingOrders,
  lowStockCount,
  settings,
}: {
  products: Product[];
  pendingOrders?: number;
  lowStockCount?: number;
  settings: AdSettings;
}) {
  const [postType, setPostType] = useState(POST_TYPE_OPTIONS[0].value);
  const maxSelected = postType === "COMBO" ? 4 : 1;
  const [selected, setSelected] = useState<string[]>(products.slice(0, 1).map((p) => p.id));
  const [title, setTitle] = useState("PRODUCTO DESTACADO");
  const [subtitle, setSubtitle] = useState("Oferta especial");
  const [priceLabel, setPriceLabel] = useState("Precio especial");
  const [locationBadge, setLocationBadge] = useState(cityFromAddress(settings.address));
  const [format, setFormat] = useState(FORMATS[0].value);
  const [background, setBackground] = useState(BACKGROUNDS[0].value);
  const [showPartnerLogo, setShowPartnerLogo] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SavedCombo[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedProducts = useMemo(() => products.filter((p) => selected.includes(p.id)), [products, selected]);
  const comboPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const individualPrice = comboPrice;
  const bgImage = customImage ?? selectedProducts[0]?.images?.[0] ?? null;
  const isLight = background === "#ffffff";
  const formatInfo = FORMATS.find((f) => f.value === format) ?? FORMATS[0];

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= maxSelected) return maxSelected === 1 ? [id] : prev;
      return [...prev, id];
    });
  }

  function changePostType(value: typeof postType) {
    setPostType(value);
    if (value !== "COMBO") setSelected((prev) => prev.slice(0, 1));
  }

  async function handleCustomImage(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      setCustomImage(await uploadImage(files[0]));
    } finally {
      setUploadingImage(false);
    }
  }

  async function loadHistory() {
    const res = await fetch("/api/combos");
    const data = await res.json();
    setHistory(data);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function saveCombo() {
    setSaving(true);
    try {
      await fetch("/api/combos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          type: postType,
          format,
          background,
          comboPrice,
          savings: 0,
          productIds: selected,
        }),
      });
      await loadHistory();
    } finally {
      setSaving(false);
    }
  }

  async function removeCombo(id: string) {
    if (!confirm("¿Eliminar este combo guardado?")) return;
    await fetch(`/api/combos/${id}`, { method: "DELETE" });
    await loadHistory();
  }

  async function downloadImage() {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(previewRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `diose-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Publicidad" pendingOrders={pendingOrders} lowStockCount={lowStockCount} />

      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <div className="h-14 bg-white border-b border-diose-border-light flex flex-wrap items-center justify-between gap-3 px-7 shrink-0 py-2">
          <div className="flex items-center gap-4">
            <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Publicidad y Combos</span>
            <span className="text-[11px] border border-diose-border px-2.5 py-1 text-gray-600 tracking-[0.06em]">
              {formatInfo.label} · {formatInfo.dims}
            </span>
          </div>
          <div className="flex gap-2.5 items-center">
            <span onClick={() => setHistoryOpen(true)} className="text-xs text-gray-400 underline cursor-pointer">
              Ver historial ({history.length})
            </span>
            <div className="w-px h-4.5 bg-diose-border" />
            <button
              onClick={saveCombo}
              disabled={saving || selected.length === 0}
              className="border border-diose-border px-4 py-2 text-xs font-semibold tracking-[0.08em] cursor-pointer text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar combo"}
            </button>
            <button
              onClick={downloadImage}
              disabled={downloading}
              className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-2 text-xs font-semibold tracking-[0.08em] cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {downloading ? "Generando..." : "Descargar imagen"}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* PANEL 1: Product library */}
          <div className="w-full lg:w-70 bg-white border-b lg:border-b-0 lg:border-r border-diose-border-light flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
                Seleccionar producto{maxSelected > 1 ? "s" : ""}
              </div>
              <div className="border border-diose-border px-2.5 py-2 bg-[#FAFAFA] text-xs text-gray-400">
                Buscar...
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2 max-h-80 lg:max-h-none">
              {products.length === 0 && (
                <div className="px-4 py-6 text-xs text-gray-400 text-center">
                  Aún no tienes productos. Agrega productos en Admin → Productos para usarlos aquí, o sube una imagen
                  propia abajo en &quot;Imagen del post&quot;.
                </div>
              )}
              {products.map((p) => {
                const isSelected = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 cursor-pointer border-l-[3px] text-left ${
                      isSelected ? "bg-diose-amber/[0.06] border-diose-amber" : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center ${
                        isSelected ? "bg-diose-amber border-diose-amber" : "border-[1.5px] border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </div>
                    <div className="w-8 h-8 bg-[#F0F0F0] shrink-0 overflow-hidden">
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-diose-black truncate">{p.name}</div>
                      <div className={`text-[10px] ${isSelected ? "text-diose-amber" : "text-gray-300"}`}>
                        {p.brand} · ${p.price.toLocaleString("es-MX")}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-gray-100 bg-[#FAFAFA]">
              <div className="text-[11px] text-gray-400 text-center">
                {selected.length} seleccionado{selected.length === 1 ? "" : "s"}{" "}
                <span className="text-diose-amber">(máx. {maxSelected})</span>
              </div>
            </div>
          </div>

          {/* PANEL 2: Preview */}
          <div className="flex-1 flex flex-col items-center justify-center bg-[#E8E8E8] p-6 gap-4 overflow-auto">
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
              Vista previa
            </div>
            <div
              ref={previewRef}
              className="w-full shrink-0 overflow-hidden relative shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
              style={{
                aspectRatio: formatInfo.ratio,
                maxWidth: format === "story" ? 280 : format === "banner" ? 480 : 420,
                background: bgImage ? "#000" : background,
              }}
            >
              {bgImage && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: `url('${bgImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
                />
              )}
              {postType === "COMBO" && selectedProducts.length > 1 && (
                <div className="absolute inset-0 grid grid-cols-2">
                  {selectedProducts.slice(0, 4).map((p) => (
                    <div key={p.id} className="overflow-hidden border border-black/20">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#1a1a1a]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.9) 100%)",
                }}
              />

              {/* TOP: logos */}
              <div className="absolute top-0 left-0 right-0 flex items-center px-4 py-3 gap-2">
                <svg width="20" height="18" viewBox="0 0 56 50" fill="none" className="shrink-0">
                  <path d="M28 3 L54 48 L2 48 Z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
                <span className="font-heading text-sm text-white tracking-[0.1em]">DIOSE</span>
                {showPartnerLogo && settings.partnerLogoUrl && (
                  <>
                    <div className="w-px h-6 bg-white/30 mx-1" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.partnerLogoUrl} alt="" className="h-6 object-contain" />
                    {settings.partnerName && (
                      <span className="text-[10px] text-white/80 font-medium leading-tight max-w-[90px]">
                        {settings.partnerName}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* TITLE BLOCK */}
              <div className="absolute left-0 right-0 px-4" style={{ top: "30%" }}>
                <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-diose-amber mb-1.5">
                  {subtitle}
                </div>
                <div
                  className="font-heading text-2xl sm:text-3xl leading-[0.95] tracking-[0.01em] text-white"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
                >
                  {title}
                </div>
              </div>

              {/* PRICE BANNER */}
              <div className="absolute left-0 right-0 bottom-12 px-4">
                <div className="bg-diose-amber inline-block px-3 py-1.5">
                  <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-white/90">{priceLabel}</div>
                  <div className="font-heading text-2xl sm:text-[32px] text-white leading-none">
                    ${(postType === "COMBO" ? comboPrice : individualPrice).toLocaleString("es-MX")}
                  </div>
                </div>
              </div>

              {/* BOTTOM BAR: phones + location */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 gap-2">
                <div className="flex flex-col gap-0.5">
                  {settings.phone && <span className="text-[9px] text-white/80 tracking-[0.04em]">📞 {settings.phone}</span>}
                  {settings.phone2 && <span className="text-[9px] text-white/80 tracking-[0.04em]">📞 {settings.phone2}</span>}
                </div>
                {locationBadge && (
                  <span className="text-[8px] text-white bg-white/15 px-2 py-1 tracking-[0.04em] uppercase shrink-0">
                    📍 {locationBadge}
                  </span>
                )}
              </div>
            </div>
            <div className="text-[11px] text-gray-400 tracking-[0.04em]">
              {formatInfo.dims} · {formatInfo.help}
            </div>
          </div>

          {/* PANEL 3: Options */}
          <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-diose-border-light shrink-0 p-5 flex flex-col gap-4.5 overflow-y-auto">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
                Tipo de publicación
              </div>
              <div className="flex flex-col gap-1.5">
                {POST_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => changePostType(type.value)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-left ${
                      postType === type.value ? "border-[1.5px] border-diose-amber bg-diose-amber/5" : "border border-diose-border"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center ${
                        postType === type.value ? "bg-diose-amber" : "border-[1.5px] border-gray-300"
                      }`}
                    >
                      {postType === type.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs ${postType === type.value ? "font-medium text-diose-amber" : "text-gray-600"}`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Título" value={title} onChange={setTitle} />
            <Field label="Frase / etiqueta (arriba del título)" value={subtitle} onChange={setSubtitle} />
            <Field label="Texto de la banda de precio" value={priceLabel} onChange={setPriceLabel} />
            <Field label="Texto de ubicación (opcional)" value={locationBadge} onChange={setLocationBadge} />

            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
                Imagen del post {selectedProducts[0]?.images?.[0] && !customImage ? "(usando foto del producto)" : ""}
              </div>
              <div className="flex items-center gap-2.5">
                {customImage && (
                  <div className="relative w-12 h-12 shrink-0 overflow-hidden border border-diose-border-light">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customImage} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setCustomImage(null)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-diose-black text-white text-[9px] flex items-center justify-center cursor-pointer rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <label className="flex-1 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-xs py-2.5 hover:border-diose-amber">
                  {uploadingImage ? "Subiendo..." : customImage ? "Cambiar imagen" : "+ Subir imagen propia"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => handleCustomImage(e.target.files)}
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">Formato</div>
              <div className="flex border border-diose-border">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`flex-1 py-2 text-center cursor-pointer border-l border-diose-border first:border-l-0 ${
                      format === f.value ? "bg-diose-black text-white" : "text-gray-600"
                    }`}
                  >
                    <span className="text-[11px]">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
                Color de fondo {bgImage ? "(se usa si quitas la imagen)" : ""}
              </div>
              <div className="flex gap-2">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setBackground(bg.value)}
                    title={bg.label}
                    className="w-9 h-9 cursor-pointer relative border border-diose-border"
                    style={{ background: bg.value }}
                  >
                    {background === bg.value && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-diose-amber rounded-full flex items-center justify-center">
                        <svg width="7" height="7" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {settings.partnerLogoUrl && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPartnerLogo}
                  onChange={(e) => setShowPartnerLogo(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-xs text-gray-600">
                  Mostrar logo de {settings.partnerName || "socio"} junto al de DIOSE
                </span>
              </label>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={saveCombo}
                disabled={saving || selected.length === 0}
                className="border border-diose-border p-3 text-center cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="text-[13px] font-semibold tracking-[0.06em] text-gray-700">
                  {saving ? "Guardando..." : "Guardar combo"}
                </span>
              </button>
              <button
                onClick={downloadImage}
                disabled={downloading}
                className="bg-diose-amber hover:bg-diose-amber-dark text-white p-3.5 text-center cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span className="text-[13px] font-semibold tracking-[0.08em] uppercase">
                  {downloading ? "Generando..." : "Descargar imagen"}
                </span>
              </button>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-diose-border p-2.5 text-center cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <WhatsAppIcon size={13} color="#555" />
                <span className="text-xs text-gray-600 tracking-[0.04em]">Compartir por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-7 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="font-heading text-lg text-diose-black">Historial de publicidad</div>
              <button onClick={() => setHistoryOpen(false)} className="text-gray-400 cursor-pointer text-sm">
                Cerrar ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {history.map((c) => (
                <div key={c.id} className="border border-diose-border-light p-4 flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0" style={{ background: c.background }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-diose-black">{c.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {c.format} · {c.createdAt} · {c.products.join(", ")}
                    </div>
                    {c.comboPrice != null && (
                      <div className="text-xs text-diose-amber font-semibold mt-1">
                        ${c.comboPrice.toLocaleString("es-MX")}
                      </div>
                    )}
                  </div>
                  <span
                    onClick={() => removeCombo(c.id)}
                    className="text-xs text-gray-300 cursor-pointer hover:text-diose-danger shrink-0"
                  >
                    ✕
                  </span>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-10">Aún no has guardado ninguna publicidad.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-diose-border px-3 py-2.5 text-[13px] text-diose-black font-medium outline-none focus:border-diose-black"
      />
    </div>
  );
}
