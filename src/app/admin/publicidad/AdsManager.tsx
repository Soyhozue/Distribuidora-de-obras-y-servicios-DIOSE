"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import ConfirmModal from "@/components/ConfirmModal";
import type { Product } from "@/data/products";

const POST_TYPE_OPTIONS = [
  { label: "Producto individual", value: "INDIVIDUAL" as const },
  { label: "Combo de productos", value: "COMBO" as const },
  { label: "Oferta / Promoción", value: "OFERTA" as const },
  { label: "Banner informativo", value: "BANNER" as const },
];

const FORMATS = [
  { label: "Post", value: "square", ratio: "1/1", w: 420, dims: "1080 × 1080 px", help: "Instagram / Facebook feed" },
  { label: "Historia", value: "story", ratio: "9/16", w: 240, dims: "1080 × 1920 px", help: "Instagram / Facebook story" },
  { label: "Banner", value: "banner", ratio: "1200/628", w: 520, dims: "1200 × 628 px", help: "Anuncio web / Facebook ad" },
];

const PRESET_BACKGROUNDS = [
  "#0A0A0A", "#0c1f44", "#7a0c14", "#1a4731", "#3d1f6e", "#ffffff",
];

const PRESET_ACCENTS = [
  "#F5A623", "#E53E3E", "#2B6CB0", "#276749", "#D69E2E", "#ffffff",
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
  id: string; title: string; subtitle: string | null; type: string;
  format: string; background: string; comboPrice: number | null;
  savings: number | null; createdAt: string; products: string[];
};

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) throw new Error("Error al subir la imagen");
  return (await res.json()).url as string;
}

// Inline DIOSE logo for html2canvas compatibility (no Next/Image)
function DioseLogoInline({ size = 28, textColor = "#fff" }: { size?: number; textColor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-diose.png" alt="DIOSE" width={size} height={size}
        style={{ filter: textColor === "#111" ? "none" : "brightness(0) invert(1)", objectFit: "contain" }} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size * 0.75, color: textColor, letterSpacing: "0.1em" }}>DIOSE</span>
        <span style={{ fontSize: size * 0.27, color: textColor, opacity: 0.6, letterSpacing: "0.04em", marginTop: 1 }}>
          Distribuidora de obras y servicios
        </span>
      </div>
    </div>
  );
}

export default function AdsManager({ products, settings }: { products: Product[]; settings: AdSettings }) {
  const [postType, setPostType] = useState(POST_TYPE_OPTIONS[0].value);
  const maxSelected = postType === "COMBO" ? 4 : 1;
  const [selected, setSelected] = useState<string[]>(products.slice(0, 1).map((p) => p.id));
  const [title, setTitle] = useState("PRODUCTO DESTACADO");
  const [subtitle, setSubtitle] = useState("Oferta especial");
  const [priceLabel, setPriceLabel] = useState("PRECIO ESPECIAL");
  const [customPriceStr, setCustomPriceStr] = useState("");
  const [showPrice, setShowPrice] = useState(true);
  const [locationBadge, setLocationBadge] = useState(() => {
    const parts = settings.address.split(",").map(p => p.trim()).filter(Boolean);
    return parts.length >= 2 ? `${parts[parts.length - 2]}, ${parts[parts.length - 1]}` : settings.address;
  });
  const [format, setFormat] = useState(FORMATS[0].value);
  const [background, setBackground] = useState(PRESET_BACKGROUNDS[0]);
  const [customBg, setCustomBg] = useState("");
  const [accentColor, setAccentColor] = useState(PRESET_ACCENTS[0]);
  const [customAccent, setCustomAccent] = useState("");
  const [textDark, setTextDark] = useState(false);
  const [imagePosition, setImagePosition] = useState<"center" | "top" | "bottom" | "left" | "right">("center");
  const [imageScale, setImageScale] = useState(100);
  const [showPartnerLogo, setShowPartnerLogo] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SavedCombo[]>([]);
  const [search, setSearch] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const [confirmComboId, setConfirmComboId] = useState<string | null>(null);

  const selectedProducts = useMemo(() => products.filter((p) => selected.includes(p.id)), [products, selected]);
  const autoPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const displayPrice = customPriceStr !== "" ? Number(customPriceStr.replace(/[^0-9.]/g, "")) : autoPrice;
  const bgImage = customImage ?? selectedProducts[0]?.images?.[0] ?? null;
  const finalBg = customBg || background;
  const finalAccent = customAccent || accentColor;
  const textColor = textDark ? "#111" : "#fff";
  const formatInfo = FORMATS.find((f) => f.value === format) ?? FORMATS[0];
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
  );

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
    if (!files?.length) return;
    setUploadingImage(true);
    try { setCustomImage(await uploadImage(files[0])); }
    finally { setUploadingImage(false); }
  }

  async function loadHistory() {
    const res = await fetch("/api/combos");
    setHistory(await res.json());
  }

  useEffect(() => { loadHistory(); }, []);

  async function saveCombo() {
    setSaving(true);
    try {
      await fetch("/api/combos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, type: postType, format, background: finalBg, comboPrice: displayPrice, savings: 0, productIds: selected }),
      });
      await loadHistory();
    } finally { setSaving(false); }
  }

  async function removeCombo(id: string) {
    await fetch(`/api/combos/${id}`, { method: "DELETE" });
    await loadHistory();
  }

  async function downloadImage() {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(previewRef.current, { backgroundColor: null, scale: 3, useCORS: true });
      const link = document.createElement("a");
      link.download = `diose-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally { setDownloading(false); }
  }

  // ─── Shared image style based on position/scale ───
  const imgStyle: React.CSSProperties = {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover",
    objectPosition: imagePosition === "left" ? "left center"
      : imagePosition === "right" ? "right center"
      : imagePosition === "top" ? "center top"
      : imagePosition === "bottom" ? "center bottom"
      : "center center",
    transform: `scale(${imageScale / 100})`,
    transformOrigin: imagePosition === "left" ? "left center"
      : imagePosition === "right" ? "right center"
      : imagePosition === "top" ? "center top"
      : imagePosition === "bottom" ? "center bottom"
      : "center center",
  };

  // ─── Gradient overlay ───
  const overlayStyle: React.CSSProperties = {
    position: "absolute", inset: 0,
    background: format === "banner"
      ? `linear-gradient(to right, ${finalBg}ee 40%, ${finalBg}88 70%, transparent 100%)`
      : `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.92) 100%)`,
  };

  const isStory = format === "story";
  const isBanner = format === "banner";

  return (
    <div className="flex flex-col flex-1">
      <div className="h-14 bg-white border-b border-diose-border-light flex flex-wrap items-center justify-between gap-3 px-7 shrink-0 py-2">
        <div className="flex items-center gap-4">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Publicidad y Combos</span>
          <span className="text-[11px] border border-diose-border px-2.5 py-1 text-gray-600 tracking-[0.06em]">
            {formatInfo.label} · {formatInfo.dims}
          </span>
        </div>
        <div className="flex gap-2.5 items-center">
          <span onClick={() => setHistoryOpen(true)} className="text-xs text-gray-400 underline cursor-pointer">
            Historial ({history.length})
          </span>
          <div className="w-px h-4.5 bg-diose-border" />
          <button onClick={saveCombo} disabled={saving || selected.length === 0}
            className="border border-diose-border px-4 py-2 text-xs font-semibold tracking-[0.08em] cursor-pointer text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={downloadImage} disabled={downloading}
            className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-2 text-xs font-semibold tracking-[0.08em] cursor-pointer transition-colors disabled:opacity-50">
            {downloading ? "Generando..." : "Descargar imagen"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* PANEL 1: Productos */}
        <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-diose-border-light flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">Seleccionar producto{maxSelected > 1 ? "s" : ""}</div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full border border-diose-border px-2.5 py-2 bg-[#FAFAFA] text-xs outline-none focus:border-diose-black"
            />
          </div>
          <div className="flex-1 overflow-y-auto py-1 max-h-72 lg:max-h-none">
            {filteredProducts.map((p) => {
              const isSel = selected.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggle(p.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 cursor-pointer border-l-[3px] text-left ${isSel ? "bg-diose-amber/[0.06] border-diose-amber" : "border-transparent hover:bg-gray-50"}`}>
                  <div className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center ${isSel ? "bg-diose-amber border-diose-amber" : "border-[1.5px] border-gray-300"}`}>
                    {isSel && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,6 5,9 10,3" /></svg>}
                  </div>
                  <div className="w-7 h-7 bg-[#F0F0F0] shrink-0 overflow-hidden">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-diose-black truncate">{p.name}</div>
                    <div className={`text-[10px] ${isSel ? "text-diose-amber" : "text-gray-300"}`}>{p.brand} · ${p.price.toLocaleString("es-MX")}</div>
                  </div>
                </button>
              );
            })}
            {filteredProducts.length === 0 && <div className="px-3 py-6 text-xs text-gray-400 text-center">Sin resultados</div>}
          </div>
          <div className="p-2.5 border-t border-gray-100 bg-[#FAFAFA]">
            <div className="text-[11px] text-gray-400 text-center">{selected.length} seleccionado{selected.length !== 1 ? "s" : ""} <span className="text-diose-amber">(máx. {maxSelected})</span></div>
          </div>
        </div>

        {/* PANEL 2: Vista previa */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#E0E0E0] p-6 gap-3 overflow-auto">
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">Vista previa</div>
          <div
            ref={previewRef}
            className="shrink-0 overflow-hidden relative shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            style={{
              aspectRatio: formatInfo.ratio,
              width: formatInfo.w,
              background: bgImage ? finalBg : finalBg,
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* Background image */}
            {bgImage && !isBanner && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgImage} alt="" style={imgStyle} />
            )}

            {/* Banner: image on right side */}
            {bgImage && isBanner && (
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgImage} alt="" style={{ ...imgStyle, position: "absolute" }} />
              </div>
            )}

            {/* Combo grid */}
            {postType === "COMBO" && selectedProducts.length > 1 && !customImage && (
              <div className="absolute inset-0 grid grid-cols-2">
                {selectedProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="overflow-hidden border border-black/20">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Gradient overlay */}
            {bgImage && <div style={overlayStyle} />}

            {/* ── SQUARE / STORY layout ── */}
            {!isBanner && (
              <>
                {/* Logo top-left */}
                <div style={{ position: "absolute", top: isStory ? 24 : 14, left: isStory ? 20 : 14, right: isStory ? 20 : 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <DioseLogoInline size={isStory ? 26 : 20} textColor={textColor} />
                  {showPartnerLogo && settings.partnerLogoUrl && (
                    <img src={settings.partnerLogoUrl} alt="" style={{ height: isStory ? 24 : 18, objectFit: "contain", filter: textColor === "#111" ? "none" : "brightness(0) invert(1)" }} />
                  )}
                </div>

                {/* Title block — story: center, square: 30% */}
                <div style={{ position: "absolute", left: isStory ? 20 : 14, right: isStory ? 20 : 14, top: isStory ? "38%" : "30%" }}>
                  <div style={{ fontSize: isStory ? 11 : 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: finalAccent, marginBottom: 5 }}>{subtitle}</div>
                  <div style={{ fontFamily: "'Bebas Neue', 'Arial Black', sans-serif", fontSize: isStory ? 36 : 26, lineHeight: 0.95, letterSpacing: "0.02em", color: textColor, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{title}</div>
                </div>

                {/* Price badge */}
                {showPrice && (
                  <div style={{ position: "absolute", left: isStory ? 20 : 14, bottom: isStory ? 60 : 44 }}>
                    <div style={{ background: finalAccent, display: "inline-block", padding: isStory ? "8px 14px" : "5px 10px" }}>
                      <div style={{ fontSize: isStory ? 9 : 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>{priceLabel}</div>
                      <div style={{ fontFamily: "'Bebas Neue', 'Arial Black', sans-serif", fontSize: isStory ? 34 : 24, color: "#fff", lineHeight: 1 }}>
                        ${displayPrice.toLocaleString("es-MX")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom bar */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: isStory ? "10px 20px" : "7px 14px", gap: 4 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {settings.phone && <span style={{ fontSize: isStory ? 9 : 7, color: textColor, opacity: 0.8 }}>📞 {settings.phone}</span>}
                    {settings.phone2 && <span style={{ fontSize: isStory ? 9 : 7, color: textColor, opacity: 0.8 }}>📞 {settings.phone2}</span>}
                  </div>
                  {locationBadge && (
                    <span style={{ fontSize: isStory ? 8 : 7, color: textColor, background: "rgba(255,255,255,0.15)", padding: "3px 7px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      📍 {locationBadge}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* ── BANNER layout ── */}
            {isBanner && (
              <>
                {/* Left content area */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 24px", width: "50%" }}>
                  <DioseLogoInline size={22} textColor={textColor} />
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: finalAccent, marginBottom: 4 }}>{subtitle}</div>
                    <div style={{ fontFamily: "'Bebas Neue','Arial Black',sans-serif", fontSize: 28, lineHeight: 0.95, color: textColor, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{title}</div>
                  </div>
                  {showPrice && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ background: finalAccent, display: "inline-block", padding: "5px 10px" }}>
                        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: 1 }}>{priceLabel}</div>
                        <div style={{ fontFamily: "'Bebas Neue','Arial Black',sans-serif", fontSize: 26, color: "#fff", lineHeight: 1 }}>${displayPrice.toLocaleString("es-MX")}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                    {settings.phone && <span style={{ fontSize: 7, color: textColor, opacity: 0.8 }}>📞 {settings.phone}</span>}
                    {locationBadge && <span style={{ fontSize: 7, color: textColor, background: "rgba(255,255,255,0.15)", padding: "2px 6px" }}>📍 {locationBadge}</span>}
                  </div>
                </div>
                {/* Accent strip */}
                <div style={{ position: "absolute", left: "47%", top: 0, bottom: 0, width: 3, background: finalAccent }} />
              </>
            )}
          </div>
          <div className="text-[11px] text-gray-400 tracking-[0.04em]">{formatInfo.dims} · {formatInfo.help}</div>
        </div>

        {/* PANEL 3: Controles */}
        <div className="w-full lg:w-76 bg-white border-t lg:border-t-0 lg:border-l border-diose-border-light shrink-0 flex flex-col overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">

            {/* Tipo */}
            <Section label="Tipo de publicación">
              <div className="flex flex-col gap-1">
                {POST_TYPE_OPTIONS.map((type) => (
                  <button key={type.value} onClick={() => changePostType(type.value)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-left ${postType === type.value ? "border-[1.5px] border-diose-amber bg-diose-amber/5" : "border border-diose-border"}`}>
                    <div className={`w-3 h-3 rounded-full shrink-0 flex items-center justify-center ${postType === type.value ? "bg-diose-amber" : "border-[1.5px] border-gray-300"}`}>
                      {postType === type.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs ${postType === type.value ? "font-medium text-diose-amber" : "text-gray-600"}`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Texto */}
            <Section label="Textos">
              <Field label="Título principal" value={title} onChange={setTitle} />
              <Field label="Frase / etiqueta (sobre el título)" value={subtitle} onChange={setSubtitle} />
              <Field label="Texto de ubicación" value={locationBadge} onChange={setLocationBadge} />
            </Section>

            {/* Precio */}
            <Section label="Precio">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} className="cursor-pointer" />
                <span className="text-xs text-gray-600">Mostrar banda de precio</span>
              </label>
              {showPrice && (
                <>
                  <Field label="Etiqueta del precio" value={priceLabel} onChange={setPriceLabel} />
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">
                      Precio a mostrar <span className="text-gray-300 normal-case font-normal">(vacío = precio del producto)</span>
                    </div>
                    <input
                      value={customPriceStr}
                      onChange={e => setCustomPriceStr(e.target.value)}
                      placeholder={`$${autoPrice.toLocaleString("es-MX")}`}
                      className="w-full border border-diose-border px-3 py-2 text-[13px] text-diose-black outline-none focus:border-diose-black"
                    />
                  </div>
                </>
              )}
            </Section>

            {/* Imagen */}
            <Section label="Imagen">
              <div className="flex items-center gap-2 mb-2">
                {customImage && (
                  <div className="relative w-10 h-10 shrink-0 overflow-hidden border border-diose-border-light">
                    <img src={customImage} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setCustomImage(null)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-diose-black text-white text-[9px] flex items-center justify-center cursor-pointer rounded-full">✕</button>
                  </div>
                )}
                <label className="flex-1 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-xs py-2 hover:border-diose-amber">
                  {uploadingImage ? "Subiendo..." : customImage ? "Cambiar imagen" : "+ Subir imagen propia"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={e => handleCustomImage(e.target.files)} />
                </label>
              </div>
              {bgImage && (
                <>
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">Posición de imagen</div>
                    <div className="grid grid-cols-5 gap-1">
                      {(["top", "left", "center", "right", "bottom"] as const).map(pos => (
                        <button key={pos} onClick={() => setImagePosition(pos)}
                          className={`py-1.5 text-[10px] cursor-pointer border ${imagePosition === pos ? "bg-diose-black text-white border-diose-black" : "border-diose-border text-gray-500 hover:border-gray-400"}`}>
                          {pos === "center" ? "Centro" : pos === "top" ? "Arriba" : pos === "bottom" ? "Abajo" : pos === "left" ? "Izq" : "Der"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">Zoom de imagen: {imageScale}%</div>
                    <input type="range" min={80} max={150} value={imageScale} onChange={e => setImageScale(Number(e.target.value))}
                      className="w-full cursor-pointer accent-diose-amber" />
                  </div>
                </>
              )}
            </Section>

            {/* Formato */}
            <Section label="Formato">
              <div className="flex border border-diose-border">
                {FORMATS.map((f) => (
                  <button key={f.value} onClick={() => setFormat(f.value)}
                    className={`flex-1 py-2 text-center cursor-pointer border-l border-diose-border first:border-l-0 ${format === f.value ? "bg-diose-black text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span className="text-[11px]">{f.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Color de fondo */}
            <Section label="Color de fondo">
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_BACKGROUNDS.map(bg => (
                  <button key={bg} onClick={() => { setBackground(bg); setCustomBg(""); }} title={bg}
                    className="w-8 h-8 cursor-pointer relative border border-diose-border" style={{ background: bg }}>
                    {(customBg || background) === bg && !customBg && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-diose-amber rounded-full flex items-center justify-center">
                        <svg width="6" height="6" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,6 5,9 10,3" /></svg>
                      </div>
                    )}
                  </button>
                ))}
                <div className="flex items-center gap-1.5">
                  <input type="color" value={customBg || background} onChange={e => setCustomBg(e.target.value)}
                    className="w-8 h-8 cursor-pointer border border-diose-border p-0" title="Color personalizado" />
                  <span className="text-[10px] text-gray-400">Personalizado</span>
                </div>
              </div>
            </Section>

            {/* Color de acento */}
            <Section label="Color de acento (precio, subtítulo)">
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_ACCENTS.map(c => (
                  <button key={c} onClick={() => { setAccentColor(c); setCustomAccent(""); }} title={c}
                    className="w-8 h-8 cursor-pointer relative border border-diose-border" style={{ background: c }}>
                    {(customAccent || accentColor) === c && !customAccent && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-diose-black rounded-full flex items-center justify-center">
                        <svg width="6" height="6" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,6 5,9 10,3" /></svg>
                      </div>
                    )}
                  </button>
                ))}
                <div className="flex items-center gap-1.5">
                  <input type="color" value={customAccent || accentColor} onChange={e => setCustomAccent(e.target.value)}
                    className="w-8 h-8 cursor-pointer border border-diose-border p-0" title="Color personalizado" />
                  <span className="text-[10px] text-gray-400">Personalizado</span>
                </div>
              </div>
            </Section>

            {/* Texto claro/oscuro */}
            <Section label="Color de texto">
              <div className="flex border border-diose-border">
                <button onClick={() => setTextDark(false)} className={`flex-1 py-2 text-[11px] cursor-pointer ${!textDark ? "bg-diose-black text-white" : "text-gray-600 hover:bg-gray-50"}`}>Claro</button>
                <button onClick={() => setTextDark(true)} className={`flex-1 py-2 text-[11px] cursor-pointer border-l border-diose-border ${textDark ? "bg-white text-black border border-gray-300" : "text-gray-600 hover:bg-gray-50"}`}>Oscuro</button>
              </div>
            </Section>

            {settings.partnerLogoUrl && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPartnerLogo} onChange={e => setShowPartnerLogo(e.target.checked)} className="cursor-pointer" />
                <span className="text-xs text-gray-600">Mostrar logo de {settings.partnerName || "socio"}</span>
              </label>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-2 pt-1">
              <button onClick={saveCombo} disabled={saving || selected.length === 0}
                className="border border-diose-border p-3 text-center cursor-pointer hover:bg-gray-50 disabled:opacity-50">
                <span className="text-[13px] font-semibold tracking-[0.06em] text-gray-700">{saving ? "Guardando..." : "Guardar combo"}</span>
              </button>
              <button onClick={downloadImage} disabled={downloading}
                className="bg-diose-amber hover:bg-diose-amber-dark text-white p-3.5 text-center cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                <span className="text-[13px] font-semibold tracking-[0.08em] uppercase">{downloading ? "Generando..." : "Descargar imagen"}</span>
              </button>
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="border border-diose-border p-2.5 text-center cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-50">
                <WhatsAppIcon size={13} color="#555" />
                <span className="text-xs text-gray-600">Compartir por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Historial */}
      {historyOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-7 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="font-heading text-lg text-diose-black">Historial de publicidad</div>
              <button onClick={() => setHistoryOpen(false)} className="text-gray-400 cursor-pointer text-sm">Cerrar ✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {history.map((c) => (
                <div key={c.id} className="border border-diose-border-light p-4 flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0 border border-diose-border-light" style={{ background: c.background }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-diose-black">{c.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{c.format} · {c.createdAt}</div>
                    {c.comboPrice != null && <div className="text-xs text-diose-amber font-semibold mt-0.5">${c.comboPrice.toLocaleString("es-MX")}</div>}
                  </div>
                  <span onClick={() => setConfirmComboId(c.id)} className="text-xs text-gray-300 cursor-pointer hover:text-diose-danger shrink-0">✕</span>
                </div>
              ))}
              {history.length === 0 && <div className="text-center text-gray-400 text-sm py-10">Aún no has guardado ninguna publicidad.</div>}
            </div>
          </div>
        </div>
      )}

      {confirmComboId && (
        <ConfirmModal
          message="¿Eliminar este combo guardado?"
          onConfirm={() => { const id = confirmComboId; setConfirmComboId(null); removeCombo(id); }}
          onCancel={() => setConfirmComboId(null)}
        />
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">{label}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] text-gray-400 mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-diose-border px-3 py-2 text-[13px] text-diose-black outline-none focus:border-diose-black" />
    </div>
  );
}
