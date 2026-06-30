"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductIcon } from "@/components/icons";
import type { Product } from "@/data/products";
import type { ManagedProduct } from "@/lib/data";

type Option = { id: string; name: string };

const PAGE_SIZE = 8;

function StatusTag({ status }: { status: Product["stockStatus"] }) {
  if (status === "AGOTADO") {
    return (
      <span className="text-[10px] bg-diose-danger/10 text-diose-danger border border-diose-danger/30 px-2 py-0.5 tracking-[0.07em] uppercase inline-block">
        Agotado
      </span>
    );
  }
  if (status === "STOCK_BAJO") {
    return (
      <span className="text-[10px] bg-diose-amber/10 text-diose-amber border border-diose-amber/40 px-2 py-0.5 tracking-[0.07em] uppercase inline-block">
        Stock bajo
      </span>
    );
  }
  return (
    <span className="text-[10px] bg-diose-success/10 text-diose-success border border-diose-success/25 px-2 py-0.5 tracking-[0.07em] uppercase inline-block">
      En stock
    </span>
  );
}

type FormState = {
  id?: string;
  sku: string;
  name: string;
  description: string;
  benefits: string;
  applications: string;
  characteristics: string;
  price: string;
  unit: string;
  stock: string;
  stockStatus: Product["stockStatus"];
  categoryId: string;
  brandId: string;
  featured: boolean;
  images: string[];
};

function parseDescriptionField(raw: string | null | undefined) {
  if (!raw) return { main: "", benefits: "", applications: "", characteristics: "" };
  const lower = raw.toLowerCase();
  const charIdx  = lower.indexOf("[caracteristicas]");
  const benefIdx = lower.indexOf("[beneficios]");
  const appIdx   = lower.indexOf("[aplicaciones]");

  const markers = [charIdx, benefIdx, appIdx].filter((i) => i !== -1);
  const firstMarker = markers.length ? Math.min(...markers) : Infinity;
  const main = firstMarker !== Infinity ? raw.slice(0, firstMarker).trim() : raw.trim();

  function extractBlock(idx: number, markerLen: number) {
    if (idx === -1) return "";
    const start = idx + markerLen;
    const next = [charIdx, benefIdx, appIdx].filter((i) => i !== -1 && i > idx).sort((a, b) => a - b)[0] ?? raw!.length;
    return raw!.slice(start, next).trim();
  }

  return {
    main,
    characteristics: extractBlock(charIdx, "[caracteristicas]".length),
    benefits:        extractBlock(benefIdx, "[beneficios]".length),
    applications:    extractBlock(appIdx,   "[aplicaciones]".length),
  };
}

function serializeDescription(main: string, benefits: string, applications: string, characteristics: string): string {
  let result = main.trim();
  if (characteristics.trim()) result += `\n\n[caracteristicas]\n${characteristics.trim()}`;
  if (benefits.trim()) result += `\n\n[beneficios]\n${benefits.trim()}`;
  if (applications.trim()) result += `\n\n[aplicaciones]\n${applications.trim()}`;
  return result;
}

function emptyForm(categories: Option[], brands: Option[]): FormState {
  return {
    sku: "",
    name: "",
    description: "",
    benefits: "",
    applications: "",
    characteristics: "",
    price: "",
    unit: "",
    stock: "0",
    stockStatus: "EN_STOCK",
    categoryId: categories[0]?.id ?? "",
    brandId: brands[0]?.id ?? "",
    featured: false,
    images: [],
  };
}

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) throw new Error("Error al subir la imagen");
  const data = await res.json();
  return data.url as string;
}

export default function ProductsManager({
  products,
  categories,
  brands,
}: {
  products: ManagedProduct[];
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState<"category" | "brand" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(categories, brands));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (brandFilter && p.brandId !== brandFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, brandFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setForm(emptyForm(categories, brands));
    setModalOpen(true);
  }

  function openEdit(p: ManagedProduct) {
    const { main, benefits, applications, characteristics } = parseDescriptionField(p.description);
    setForm({
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: main,
      benefits,
      applications,
      characteristics,
      price: String(p.price),
      unit: p.unit ?? "",
      stock: String(p.stock),
      stockStatus: p.stockStatus,
      categoryId: p.categoryId,
      brandId: p.brandId,
      featured: !!p.featured,
      images: p.images ?? [],
    });
    setModalOpen(true);
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadImage));
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded].slice(0, 6) }));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  async function save() {
    setSaving(true);
    try {
      const fullDescription = serializeDescription(form.description, form.benefits, form.applications, form.characteristics);
      const payload = {
        sku: form.sku,
        name: form.name,
        description: fullDescription || undefined,
        price: Number(form.price),
        unit: form.unit || undefined,
        stock: Number(form.stock),
        stockStatus: form.stockStatus,
        categoryId: form.categoryId,
        brandId: form.brandId,
        featured: form.featured,
        images: form.images,
      };
      if (form.id) {
        await fetch(`/api/products/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id: string) {
    if (!confirm("¿Eliminar este producto? No se puede deshacer.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex flex-wrap items-center justify-between gap-3 px-9 shrink-0 py-2">
        <div className="flex items-baseline gap-4">
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Catálogo</span>
          <span className="text-xs text-gray-400">{filtered.length} productos</span>
        </div>
        <div className="flex gap-3 items-center relative">
          <div className="border border-diose-border px-3.5 py-1.5 flex items-center gap-2 bg-[#FAFAFA] w-44">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar productos..."
              className="text-xs text-gray-600 bg-transparent outline-none w-full placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(showFilters === "category" ? null : "category")}
              className="border border-diose-border px-3.5 py-1.5 text-xs text-gray-600 bg-white cursor-pointer"
            >
              {categories.find((c) => c.id === categoryFilter)?.name ?? "Categoría"}
            </button>
            {showFilters === "category" && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-diose-border shadow-lg z-10 min-w-[160px]">
                <div
                  className="px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setCategoryFilter("");
                    setShowFilters(null);
                    setPage(1);
                  }}
                >
                  Todas
                </div>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setCategoryFilter(c.id);
                      setShowFilters(null);
                      setPage(1);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(showFilters === "brand" ? null : "brand")}
              className="border border-diose-border px-3.5 py-1.5 text-xs text-gray-600 bg-white cursor-pointer"
            >
              {brands.find((b) => b.id === brandFilter)?.name ?? "Marca"}
            </button>
            {showFilters === "brand" && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-diose-border shadow-lg z-10 min-w-[160px]">
                <div
                  className="px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setBrandFilter("");
                    setShowFilters(null);
                    setPage(1);
                  }}
                >
                  Todas
                </div>
                {brands.map((b) => (
                  <div
                    key={b.id}
                    className="px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setBrandFilter(b.id);
                      setShowFilters(null);
                      setPage(1);
                    }}
                  >
                    {b.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={openCreate}
            className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-1.5 text-[13px] font-semibold tracking-[0.06em] cursor-pointer transition-colors"
          >
            + Añadir producto
          </button>
        </div>
      </div>

      <div className="flex-1 p-9 pt-5 overflow-hidden">
        <div className="bg-white border border-diose-border overflow-hidden">
          <div className="min-w-[820px] overflow-x-auto">
            <div className="grid grid-cols-[36px_52px_1fr_110px_90px_80px_70px_110px_90px] px-4 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black items-center gap-2">
              <div className="w-3.5 h-3.5 border-[1.5px] border-gray-300" />
              {["Img", "Nombre / SKU", "Categoría", "Marca", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                <span key={h} className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                  {h}
                </span>
              ))}
            </div>

            {pageItems.map((p) => (
              <div
                key={p.id}
                className={`grid grid-cols-[36px_52px_1fr_110px_90px_80px_70px_110px_90px] px-4 py-2.5 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA] ${
                  p.stockStatus === "AGOTADO" ? "opacity-70" : ""
                }`}
              >
                <div className="w-3.5 h-3.5 border-[1.5px] border-gray-300" />
                <div
                  className="w-10 h-10 bg-[#F0F0F0] flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundImage: "radial-gradient(#DCDCDC 1px,transparent 1px)", backgroundSize: "10px 10px" }}
                >
                  {p.images && p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ProductIcon icon={p.icon} size={16} />
                  )}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-diose-black">{p.name}</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">SKU-{p.sku}</div>
                </div>
                <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 inline-block w-fit">
                  {p.category}
                </span>
                <span className="text-xs text-gray-600">{p.brand}</span>
                <span className="text-[13px] font-semibold text-diose-black">
                  ${p.price.toLocaleString("es-MX")}
                  {p.unit && <span className="text-[10px] font-normal text-gray-400">{p.unit}</span>}
                </span>
                <span
                  className={`text-[13px] ${
                    p.stockStatus === "STOCK_BAJO"
                      ? "text-diose-amber font-medium"
                      : p.stockStatus === "AGOTADO"
                        ? "text-diose-danger font-semibold"
                        : "text-gray-700"
                  }`}
                >
                  {p.stock} uds
                </span>
                <StatusTag status={p.stockStatus} />
                <div className="flex gap-3 items-center">
                  <span onClick={() => openEdit(p)} className="text-xs text-gray-600 underline cursor-pointer">
                    Editar
                  </span>
                  <span
                    onClick={() => removeProduct(p.id)}
                    className="text-xs text-gray-300 cursor-pointer hover:text-diose-danger"
                  >
                    ✕
                  </span>
                </div>
              </div>
            ))}

            {pageItems.length === 0 && (
              <div className="px-4 py-10 text-center text-xs text-gray-400">No se encontraron productos.</div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <span className="text-xs text-gray-400">
            Mostrando {pageItems.length} de {filtered.length} productos
          </span>
          <div className="flex gap-1 items-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 flex items-center justify-center cursor-pointer ${
                  page === n ? "bg-diose-black" : "border border-diose-border"
                }`}
              >
                <span className={`text-xs font-medium ${page === n ? "text-white" : "text-gray-600"}`}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto">
            <div className="font-heading text-lg text-diose-black mb-5">
              {form.id ? "Editar producto" : "Añadir producto"}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Nombre</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">SKU</span>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Unidad (opcional)</span>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="/m, /kg..."
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Precio</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Stock</span>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Categoría</span>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Marca</span>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Estado</span>
                <select
                  value={form.stockStatus}
                  onChange={(e) => setForm({ ...form, stockStatus: e.target.value as Product["stockStatus"] })}
                  className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
                >
                  <option value="EN_STOCK">En stock</option>
                  <option value="STOCK_BAJO">Stock bajo</option>
                  <option value="AGOTADO">Agotado</option>
                </select>
              </label>
              <label className="flex items-center gap-2 col-span-2 mt-1">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                <span className="text-xs text-gray-600">Destacado en inicio</span>
              </label>
              <label className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Descripción</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción general del producto..."
                  className="border border-diose-border px-3 py-2 text-sm outline-none h-20 resize-none"
                />
              </label>
              <label className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                  Beneficios <span className="normal-case text-gray-300">(uno por línea)</span>
                </span>
                <textarea
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  placeholder={"Reduce la fricción durante la instalación\nProtege el neumático y el rin\nFácil de aplicar"}
                  className="border border-diose-border px-3 py-2 text-sm outline-none h-20 resize-none"
                />
              </label>
              <label className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                  Aplicaciones <span className="normal-case text-gray-300">(una por línea)</span>
                </span>
                <textarea
                  value={form.applications}
                  onChange={(e) => setForm({ ...form, applications: e.target.value })}
                  placeholder={"Talleres de llantas\nVulcanizadoras\nCentros de servicio automotriz"}
                  className="border border-diose-border px-3 py-2 text-sm outline-none h-16 resize-none"
                />
              </label>
              <label className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                  Características <span className="normal-case text-gray-300">(una por línea — aparecen debajo de la imagen)</span>
                </span>
                <textarea
                  value={form.characteristics}
                  onChange={(e) => setForm({ ...form, characteristics: e.target.value })}
                  placeholder={"Contenido neto: 19 litros\nFórmula anticorrosiva\nApto para uso profesional"}
                  className="border border-diose-border px-3 py-2 text-sm outline-none h-16 resize-none"
                />
              </label>
              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Fotos del producto (máx. 6)</span>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((url) => (
                    <div key={url} className="relative w-16 h-16 border border-diose-border-light shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-diose-black text-white text-[10px] flex items-center justify-center cursor-pointer rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {form.images.length < 6 && (
                    <label className="w-16 h-16 border border-dashed border-diose-border flex items-center justify-center cursor-pointer text-gray-400 text-xs shrink-0 hover:border-diose-amber">
                      {uploading ? "..." : "+"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs text-gray-600 border border-diose-border cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name || !form.sku || !form.categoryId || !form.brandId}
                className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
