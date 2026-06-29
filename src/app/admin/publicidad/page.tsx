"use client";

import { useMemo, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ProductIcon, WhatsAppIcon } from "@/components/icons";
import { PRODUCTS } from "@/data/products";

const POST_TYPES = ["Combo de productos", "Post de producto individual", "Oferta / Promoción", "Banner informativo"];
const FORMATS = ["Cuadrado", "Historia", "Banner"];
const BACKGROUNDS = ["#0A0A0A", "#ffffff", "#3A3A3A"];

export default function AdminAdsPage() {
  const [selected, setSelected] = useState<string[]>([PRODUCTS[0].id, PRODUCTS[1].id, PRODUCTS[6].id]);
  const [postType, setPostType] = useState(POST_TYPES[0]);
  const [title, setTitle] = useState("COMBO PROFESIONAL");
  const [subtitle, setSubtitle] = useState("Oferta especial");
  const [format, setFormat] = useState(FORMATS[0]);
  const [background, setBackground] = useState(BACKGROUNDS[0]);

  const selectedProducts = useMemo(() => PRODUCTS.filter((p) => selected.includes(p.id)), [selected]);
  const comboPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const individualPrice = comboPrice + 510;

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="Publicidad" />

      <div className="flex-1 bg-[#F2F2F2] flex flex-col">
        <div className="h-14 bg-white border-b border-diose-border-light flex flex-wrap items-center justify-between gap-3 px-7 shrink-0 py-2">
          <div className="flex items-center gap-4">
            <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Publicidad y Combos</span>
            <span className="text-[11px] border border-diose-border px-2.5 py-1 text-gray-600 tracking-[0.06em]">
              Post {format.toLowerCase()} · 1080×1080
            </span>
          </div>
          <div className="flex gap-2.5 items-center">
            <span className="text-xs text-gray-400 underline cursor-pointer">Ver historial (8)</span>
            <div className="w-px h-4.5 bg-diose-border" />
            <button className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-2 text-xs font-semibold tracking-[0.08em] cursor-pointer flex items-center gap-1.5 transition-colors">
              Descargar imagen
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* PANEL 1: Product library */}
          <div className="w-full lg:w-70 bg-white border-b lg:border-b-0 lg:border-r border-diose-border-light flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
                Seleccionar productos
              </div>
              <div className="border border-diose-border px-2.5 py-2 bg-[#FAFAFA] text-xs text-gray-400">
                Buscar...
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2 max-h-80 lg:max-h-none">
              {PRODUCTS.map((p) => {
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
                    <div
                      className="w-8 h-8 bg-[#F0F0F0] shrink-0 flex items-center justify-center"
                      style={{ backgroundImage: "radial-gradient(#DCDCDC 1px,transparent 1px)", backgroundSize: "8px 8px" }}
                    >
                      <ProductIcon icon={p.icon} size={12} />
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
                {selected.length} productos seleccionados <span className="text-diose-amber">(máx. 4)</span>
              </div>
            </div>
          </div>

          {/* PANEL 2: Preview */}
          <div className="flex-1 flex flex-col items-center justify-center bg-[#E8E8E8] p-6 gap-4">
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
              Vista previa del combo
            </div>
            <div
              className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] shrink-0 overflow-hidden relative shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
              style={{ background: background }}
            >
              <div className="h-11 flex items-center px-4 gap-2.5 border-b border-white/[0.08]">
                <svg width="16" height="14" viewBox="0 0 56 50" fill="none">
                  <path d="M28 3 L54 48 L2 48 Z" stroke={background === "#ffffff" ? "#070707" : "#fff"} strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
                <span
                  className="font-heading text-sm tracking-[0.12em]"
                  style={{ color: background === "#ffffff" ? "#070707" : "#fff" }}
                >
                  DIOSE
                </span>
                <span className="ml-auto text-[9px] text-gray-400 tracking-[0.12em] uppercase">Ciudad Juárez</span>
              </div>
              <div className="px-4 pt-3.5 pb-2.5">
                <div className="text-[9px] font-semibold tracking-[0.18em] uppercase text-white/35 mb-1.5">
                  {subtitle}
                </div>
                <div
                  className="font-heading text-3xl md:text-[40px] leading-[0.88] tracking-[0.03em]"
                  style={{ color: background === "#ffffff" ? "#070707" : "#fff" }}
                >
                  {title}
                </div>
              </div>
              <div className="flex gap-1.5 px-4 mb-3">
                {selectedProducts.map((p) => (
                  <div key={p.id} className="flex-1 bg-white/5 border border-white/[0.08] py-2 px-1 text-center">
                    <div className="h-10 flex items-center justify-center mb-1.5">
                      <ProductIcon icon={p.icon} size={22} color="rgba(255,255,255,.25)" strokeWidth={0.9} />
                    </div>
                    <div className="text-[7px] text-white/40 uppercase tracking-[0.1em] mb-0.5">{p.brand}</div>
                    <div className="text-[8px] text-white font-medium leading-tight">{p.name}</div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-3">
                <div className="text-[8px] text-white/35 tracking-[0.16em] uppercase mb-0.5">Precio combo</div>
                <div className="font-heading text-3xl md:text-[40px] text-diose-amber tracking-[0.02em] leading-none">
                  ${comboPrice.toLocaleString("es-MX")}
                </div>
                <div className="text-[10px] text-white/35 mt-0.5">
                  Ahorro de $510 vs. precio individual (${individualPrice.toLocaleString("es-MX")})
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-white/5 border-t border-white/[0.08] flex items-center px-4 justify-between">
                <span className="text-[9px] text-white/40 tracking-[0.06em]">+52 (656) 123-4567</span>
                <span className="text-[9px] text-white/25">·</span>
                <span className="text-[9px] text-white/40 tracking-[0.06em]">diose.mx</span>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 tracking-[0.04em]">1080 × 1080 px · Instagram / Facebook</div>
          </div>

          {/* PANEL 3: Options */}
          <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-diose-border-light shrink-0 p-5 flex flex-col gap-4.5 overflow-y-auto">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">
                Tipo de publicación
              </div>
              <div className="flex flex-col gap-1.5">
                {POST_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setPostType(type)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-left ${
                      postType === type ? "border-[1.5px] border-diose-amber bg-diose-amber/5" : "border border-diose-border"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center ${
                        postType === type ? "bg-diose-amber" : "border-[1.5px] border-gray-300"
                      }`}
                    >
                      {postType === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs ${postType === type ? "font-medium text-diose-amber" : "text-gray-600"}`}>
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Título" value={title} onChange={setTitle} />
            <Field label="Subtítulo" value={subtitle} onChange={setSubtitle} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                  Precio combo
                </div>
                <div className="border border-diose-border px-3 py-2.5 text-[13px] text-diose-amber font-semibold">
                  ${comboPrice.toLocaleString("es-MX")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">Ahorro</div>
                <div className="border border-diose-border px-3 py-2.5 text-[13px] text-gray-600">$510</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">Formato</div>
              <div className="flex border border-diose-border">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 py-2 text-center cursor-pointer border-l border-diose-border first:border-l-0 ${
                      format === f ? "bg-diose-black text-white" : "text-gray-600"
                    }`}
                  >
                    <span className="text-[11px]">{f}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2.5">Fondo</div>
              <div className="flex gap-2">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setBackground(bg)}
                    className="w-9 h-9 cursor-pointer relative border border-diose-border"
                    style={{ background: bg }}
                  >
                    {background === bg && (
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

            <div className="mt-auto flex flex-col gap-2">
              <button className="bg-diose-amber hover:bg-diose-amber-dark text-white p-3.5 text-center cursor-pointer flex items-center justify-center gap-2 transition-colors">
                <span className="text-[13px] font-semibold tracking-[0.08em] uppercase">Descargar imagen</span>
              </button>
              <a
                href="https://wa.me/526561234567"
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
