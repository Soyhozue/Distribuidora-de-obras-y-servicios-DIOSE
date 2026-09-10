"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductIcon } from "@/components/icons";
import ConfirmModal from "@/components/ConfirmModal";
import { useToastStore } from "@/store/toastStore";
import type { Product } from "@/data/products";
import type { ManagedProduct } from "@/lib/data";

type Option = { id: string; name: string };

const PAGE_SIZE = 8;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// "1/4\", 3/8\", ... 7 7/8\", 8\"" — cada octavo de pulgada, sin saltos,
// como se usan las medidas de tornillería.
function buildEighthInchOptions(minEighths: number, maxEighths: number): string[] {
  const labels: string[] = [];
  for (let e = minEighths; e <= maxEighths; e++) {
    const whole = Math.floor(e / 8);
    const remainder = e % 8;
    if (remainder === 0) {
      labels.push(`${whole}"`);
      continue;
    }
    const divisor = gcd(remainder, 8);
    const fraction = `${remainder / divisor}/${8 / divisor}`;
    // Guion en vez de espacio entre el entero y la fracción: en botones
    // angostos un solo espacio casi no se nota y "1 1/4"" se confunde con
    // "11/4"" (once cuartos). parseInches() en lib/measures.ts ya soporta
    // este formato con guion.
    labels.push(whole === 0 ? `${fraction}"` : `${whole}-${fraction}"`);
  }
  return labels;
}

// Medidas típicas en tornillería (largo y grosor/diámetro) — botones y
// opciones de un clic para no tener que escribir cada una a mano.
// De 1/4" a 8", en octavos.
const INCH_FRACTION_OPTIONS = buildEighthInchOptions(2, 64);

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
  weight: string;
  stock: string;
  stockStatus: Product["stockStatus"];
  categoryId: string;
  subcategoryName: string;
  diameterLabel: string;
  brandId: string;
  featured: boolean;
  images: string[];
  minOrderQty: string;
  packLabel: string;
};

type VariantRow = {
  id?: string;
  variantLabel: string;
  sku: string;
  price: string;
  stock: string;
  minOrderQty: string;
};

type Subcategory = { id: string; name: string; categoryId: string; count: number };

type ProductRow =
  | { kind: "single"; product: ManagedProduct }
  | { kind: "family"; groupId: string; members: ManagedProduct[] };

function emptyVariantRow(): VariantRow {
  return { variantLabel: "", sku: "", price: "", stock: "0", minOrderQty: "1" };
}

function rowFromProduct(p: ManagedProduct): VariantRow {
  return {
    id: p.id,
    variantLabel: p.variantLabel ?? "",
    sku: p.sku,
    price: String(p.price),
    stock: String(p.stock),
    minOrderQty: String(p.minOrderQty ?? 1),
  };
}

function deriveStockStatus(stock: number): Product["stockStatus"] {
  if (stock <= 0) return "AGOTADO";
  if (stock <= 10) return "STOCK_BAJO";
  return "EN_STOCK";
}

function linesToText(lines: string[] | undefined): string {
  return (lines ?? []).join("\n");
}

function textToLines(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
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
    weight: "",
    stock: "0",
    stockStatus: "EN_STOCK",
    categoryId: categories[0]?.id ?? "",
    subcategoryName: "",
    diameterLabel: "",
    brandId: brands[0]?.id ?? "",
    featured: false,
    images: [],
    minOrderQty: "1",
    packLabel: "",
  };
}

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Error al subir la imagen");
  return data.url as string;
}

/**
 * A <select> that can switch into "add new" mode inline — used for
 * Categoría and Marca so the admin doesn't have to leave the product form
 * (Configuración) just to add one before finishing the product they're on.
 */
function CreatableSelect({
  label,
  value,
  options,
  onChange,
  itemLabel,
  onCreate,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
  itemLabel: string;
  onCreate: (name: string) => Promise<Option | { error: string }>;
}) {
  const showToast = useToastStore((s) => s.show);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const result = await onCreate(trimmed);
      if ("error" in result) {
        showToast(result.error, "error");
        return;
      }
      onChange(result.id);
      setName("");
      setAdding(false);
    } catch {
      showToast(`No se pudo crear ${itemLabel.toLowerCase()}.`, "error");
    } finally {
      setSaving(false);
    }
  }

  if (adding) {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">{label}</span>
        <div className="flex gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
              if (e.key === "Escape") {
                setAdding(false);
                setName("");
              }
            }}
            placeholder={`Nueva ${itemLabel.toLowerCase()}...`}
            className="flex-1 border border-diose-border px-3 py-2 text-sm outline-none bg-white min-w-0"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="text-xs px-3 border border-diose-black bg-diose-black text-white disabled:opacity-40 cursor-pointer"
          >
            {saving ? "..." : "OK"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setName("");
            }}
            className="text-xs px-2 text-gray-400 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">{label}</span>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-[10px] text-diose-amber underline cursor-pointer"
        >
          + Nueva
        </button>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProductsManager({
  products,
  categories,
  brands,
  variantGroups,
  subcategories,
}: {
  products: ManagedProduct[];
  categories: Option[];
  brands: Option[];
  variantGroups: string[];
  subcategories: Subcategory[];
}) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);

  // Categorías/marcas creadas al vuelo desde este formulario — se muestran
  // de inmediato mientras router.refresh() trae la lista real del servidor.
  const [extraCategories, setExtraCategories] = useState<Option[]>([]);
  const [extraBrands, setExtraBrands] = useState<Option[]>([]);
  const allCategories = useMemo(
    () => [...categories, ...extraCategories.filter((e) => !categories.some((c) => c.id === e.id))],
    [categories, extraCategories]
  );
  const allBrands = useMemo(
    () => [...brands, ...extraBrands.filter((e) => !brands.some((b) => b.id === e.id))],
    [brands, extraBrands]
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState<"category" | "brand" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(categories, brands));
  const [formError, setFormError] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([emptyVariantRow()]);
  const [bulkLabelsText, setBulkLabelsText] = useState("");
  const [originalVariantIds, setOriginalVariantIds] = useState<string[]>([]);

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

  const groupedRows = useMemo(() => {
    const seenGroups = new Set<string>();
    const rows: ProductRow[] = [];
    for (const p of filtered) {
      if (p.variantGroupId) {
        if (seenGroups.has(p.variantGroupId)) continue;
        seenGroups.add(p.variantGroupId);
        const members = filtered
          .filter((m) => m.variantGroupId === p.variantGroupId)
          .sort((a, b) => (a.variantOrder ?? 0) - (b.variantOrder ?? 0));
        rows.push({ kind: "family", groupId: p.variantGroupId, members });
      } else {
        rows.push({ kind: "single", product: p });
      }
    }
    return rows;
  }, [filtered]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  const totalPages = Math.max(1, Math.ceil(groupedRows.length / PAGE_SIZE));
  const pageRows = groupedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reordering writes a position to every product in the full catalog (see
  // reorderProducts in lib/data.ts), so "which row is next to which" only
  // means the same thing here as it will after the filters are cleared —
  // dragging is disabled while a search/category/brand filter narrows the
  // list to avoid silently scrambling the order of hidden products.
  const canReorder = !search && !categoryFilter && !brandFilter;
  const [draggingRowIndex, setDraggingRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  async function moveTopLevelRow(fromPageIndex: number, toPageIndex: number) {
    const base = (page - 1) * PAGE_SIZE;
    const fromGlobal = base + fromPageIndex;
    const toGlobal = base + toPageIndex;
    if (fromGlobal === toGlobal) return;

    const reordered = [...groupedRows];
    const [moved] = reordered.splice(fromGlobal, 1);
    reordered.splice(toGlobal, 0, moved);

    setSavingOrder(true);
    try {
      const rows = reordered.map((row) =>
        row.kind === "single" ? { kind: "single" as const, id: row.product.id } : { kind: "family" as const, id: row.groupId }
      );
      const res = await fetch("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      showToast("No se pudo guardar el nuevo orden. Intenta de nuevo.", "error");
    } finally {
      setSavingOrder(false);
    }
  }

  function openCreate() {
    setForm(emptyForm(categories, brands));
    setFormError("");
    setIsDuplicating(false);
    setHasVariants(false);
    setVariantRows([emptyVariantRow()]);
    setBulkLabelsText("");
    setOriginalVariantIds([]);
    setModalOpen(true);
  }

  function openEdit(p: ManagedProduct) {
    setIsDuplicating(false);
    setForm({
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description ?? "",
      benefits: linesToText(p.benefits),
      applications: linesToText(p.applications),
      characteristics: linesToText(p.characteristics),
      price: String(p.price),
      unit: p.unit ?? "",
      weight: p.weight != null ? String(p.weight) : "",
      stock: String(p.stock),
      stockStatus: p.stockStatus,
      categoryId: p.categoryId,
      subcategoryName: p.subcategory ?? "",
      diameterLabel: p.diameterLabel ?? "",
      brandId: p.brandId,
      featured: !!p.featured,
      images: p.images ?? [],
      minOrderQty: String(p.minOrderQty ?? 1),
      packLabel: p.packLabel ?? "",
    });
    const siblings = p.variantGroupId
      ? products
          .filter((sib) => sib.variantGroupId === p.variantGroupId)
          .sort((a, b) => (a.variantOrder ?? 0) - (b.variantOrder ?? 0))
      : [];
    const isFamily = siblings.length > 0;
    setHasVariants(isFamily);
    const rows = (isFamily ? siblings : [p]).map(rowFromProduct);
    setVariantRows(rows);
    setOriginalVariantIds(isFamily ? rows.map((r) => r.id!).filter(Boolean) : []);
    setFormError("");
    setModalOpen(true);
  }

  function openDuplicate(p: ManagedProduct) {
    setIsDuplicating(true);
    setForm({
      sku: "",
      name: `${p.name} (copia)`,
      description: p.description ?? "",
      benefits: linesToText(p.benefits),
      applications: linesToText(p.applications),
      characteristics: linesToText(p.characteristics),
      price: String(p.price),
      unit: p.unit ?? "",
      weight: p.weight != null ? String(p.weight) : "",
      stock: "0",
      stockStatus: "EN_STOCK",
      categoryId: p.categoryId,
      subcategoryName: p.subcategory ?? "",
      diameterLabel: p.diameterLabel ?? "",
      brandId: p.brandId,
      featured: false,
      images: p.images ?? [],
      minOrderQty: String(p.minOrderQty ?? 1),
      packLabel: p.packLabel ?? "",
    });
    setHasVariants(false);
    setVariantRows([emptyVariantRow()]);
    setBulkLabelsText("");
    setOriginalVariantIds([]);
    setFormError("");
    setModalOpen(true);
  }

  function addVariantRow() {
    setVariantRows((rows) => [...rows, emptyVariantRow()]);
  }

  // Un clic en un tamaño común llena la primera fila con la etiqueta vacía
  // en vez de siempre agregar una fila nueva — así encadenar varios clics
  // no deja huecos entre medias ya escritas a mano.
  function addQuickVariantLabel(label: string) {
    setVariantRows((rows) => {
      if (rows.some((r) => r.variantLabel.trim() === label)) return rows;
      const emptyIndex = rows.findIndex((r) => !r.variantLabel.trim());
      if (emptyIndex !== -1) {
        return rows.map((r, i) => (i === emptyIndex ? { ...r, variantLabel: label } : r));
      }
      return [...rows, { ...emptyVariantRow(), variantLabel: label }];
    });
  }

  // Pegar varias medidas separadas por coma o salto de línea de una sola
  // vez, en lugar de escribir y tabular fila por fila.
  function addBulkVariantLabels(text: string) {
    const labels = text
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (labels.length === 0) return;
    setVariantRows((rows) => {
      const existing = new Set(rows.map((r) => r.variantLabel.trim()).filter(Boolean));
      const newRows = labels
        .filter((l) => !existing.has(l))
        .map((l) => ({ ...emptyVariantRow(), variantLabel: l }));
      if (newRows.length === 0) return rows;
      const isRowFullyBlank = (r: VariantRow) => !r.variantLabel.trim() && !r.sku.trim() && !r.price.trim();
      const kept = rows.filter((r) => !isRowFullyBlank(r));
      return [...kept, ...newRows];
    });
  }

  function removeVariantRow(index: number) {
    setVariantRows((rows) => rows.filter((_, i) => i !== index));
  }

  function updateVariantRow(index: number, patch: Partial<VariantRow>) {
    setVariantRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function moveVariantRow(from: number, to: number) {
    setVariantRows((rows) => {
      if (to < 0 || to >= rows.length || from === to) return rows;
      const next = [...rows];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const results = await Promise.allSettled(Array.from(files).map(uploadImage));
      const uploaded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
      const failed = results.filter((r) => r.status === "rejected");
      if (uploaded.length > 0) {
        setForm((f) => ({ ...f, images: [...f.images, ...uploaded].slice(0, 6) }));
      }
      if (failed.length > 0) {
        const reason = (failed[0] as PromiseRejectedResult).reason;
        showToast(`${failed.length} imagen(es) no se pudieron subir: ${reason instanceof Error ? reason.message : "error desconocido"}`, "error");
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  async function resolveSubcategoryId(): Promise<string | undefined> {
    const name = form.subcategoryName.trim();
    if (!name) return undefined;
    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categoryId: form.categoryId }),
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.id as string;
    } catch {
      return undefined;
    }
  }

  async function sharedFields() {
    const subcategoryId = await resolveSubcategoryId();
    return {
      name: form.name,
      description: form.description.trim() || undefined,
      benefits: textToLines(form.benefits),
      applications: textToLines(form.applications),
      characteristics: textToLines(form.characteristics),
      unit: form.unit || undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      categoryId: form.categoryId,
      subcategoryId,
      diameterLabel: form.diameterLabel.trim() || undefined,
      brandId: form.brandId,
      featured: form.featured,
      images: form.images,
    };
  }

  async function saveSimple() {
    if (!Number(form.price) || Number(form.price) <= 0) {
      setFormError("El precio debe ser mayor a 0.");
      return;
    }
    if (!Number.isInteger(Number(form.minOrderQty)) || Number(form.minOrderQty) < 1) {
      setFormError("La cantidad mínima de venta debe ser un número entero de al menos 1.");
      return;
    }
    const payload = {
      ...(await sharedFields()),
      sku: form.sku,
      price: Number(form.price),
      stock: Number(form.stock),
      stockStatus: form.stockStatus,
      minOrderQty: form.minOrderQty ? Number(form.minOrderQty) : 1,
      packLabel: form.packLabel.trim() || undefined,
      variantGroupId: undefined,
      variantLabel: undefined,
    };
    const res = form.id
      ? await fetch(`/api/products/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(data.error ?? "No se pudo guardar el producto.");
      return false;
    }
    return true;
  }

  async function saveVariants() {
    if (variantRows.length === 0) {
      setFormError("Agrega al menos una medida.");
      return;
    }
    for (const row of variantRows) {
      if (!row.variantLabel.trim()) {
        setFormError("Cada medida necesita una etiqueta (ej. 1\", 1-1/2\").");
        return;
      }
      if (!row.sku.trim()) {
        setFormError("Cada medida necesita un SKU único.");
        return;
      }
      if (!Number(row.price) || Number(row.price) <= 0) {
        setFormError(`El precio de "${row.variantLabel}" debe ser mayor a 0.`);
        return;
      }
      if (!Number.isInteger(Number(row.minOrderQty)) || Number(row.minOrderQty) < 1) {
        setFormError(`La cantidad mínima de "${row.variantLabel}" debe ser un entero de al menos 1.`);
        return;
      }
    }
    const familyKey = form.name.trim();
    const shared = await sharedFields();
    const errors: string[] = [];

    for (let i = 0; i < variantRows.length; i++) {
      const row = variantRows[i];
      const stock = Number(row.stock) || 0;
      const payload = {
        ...shared,
        sku: row.sku,
        price: Number(row.price),
        stock,
        stockStatus: deriveStockStatus(stock),
        minOrderQty: Number(row.minOrderQty) || 1,
        variantGroupId: familyKey,
        variantLabel: row.variantLabel.trim(),
        variantOrder: i,
      };
      const res = row.id
        ? await fetch(`/api/products/${row.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        errors.push(`${row.variantLabel}: ${data.error ?? "error"}`);
      }
    }

    const keptIds = new Set(variantRows.map((r) => r.id).filter(Boolean));
    for (const id of originalVariantIds) {
      if (!keptIds.has(id)) {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errors.push(data.error ?? "No se pudo eliminar una medida quitada.");
        }
      }
    }

    if (errors.length > 0) {
      setFormError(errors.join(" · "));
      return false;
    }
    return true;
  }

  async function save() {
    setFormError("");
    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const ok = hasVariants ? await saveVariants() : await saveSimple();
      if (!ok) return;
      showToast(form.id || variantRows.some((r) => r.id) ? "Producto actualizado" : "Producto creado", "success");
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const [confirmProductId, setConfirmProductId] = useState<string | null>(null);

  async function removeProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.error ?? "No se pudo eliminar el producto.", "error");
      return;
    }
    showToast("Producto eliminado", "success");
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    router.refresh();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectPage() {
    const pageIds = pageRows.flatMap((r) => (r.kind === "single" ? [r.product.id] : r.members.map((m) => m.id)));
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleSelectGroup(members: ManagedProduct[]) {
    const ids = members.map((m) => m.id);
    const allSelected = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  async function bulkDelete() {
    setBulkDeleting(true);
    const ids = [...selectedIds];
    let failCount = 0;
    for (const id of ids) {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) failCount++;
    }
    setBulkDeleting(false);
    setSelectedIds(new Set());
    if (failCount > 0) {
      showToast(`${ids.length - failCount} eliminados, ${failCount} no se pudieron eliminar (tienen pedidos asociados).`, "error");
    } else {
      showToast(`${ids.length} producto(s) eliminado(s)`, "success");
    }
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

      {selectedIds.size > 0 && (
        <div className="bg-diose-black px-9 py-2.5 flex items-center gap-4 shrink-0">
          <span className="text-xs text-white/70">{selectedIds.size} seleccionado(s)</span>
          <button
            onClick={() => setConfirmBulkDelete(true)}
            disabled={bulkDeleting}
            className="text-[11px] font-semibold uppercase tracking-[0.06em] text-diose-danger bg-white px-3 py-1.5 cursor-pointer disabled:opacity-50"
          >
            {bulkDeleting ? "Eliminando..." : "Eliminar seleccionados"}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-[11px] text-white/50 underline cursor-pointer ml-auto"
          >
            Cancelar selección
          </button>
        </div>
      )}

      <div className="flex-1 p-9 pt-5 overflow-hidden">
        <div className="bg-white border border-diose-border overflow-hidden">
          <div className="min-w-[870px] overflow-x-auto">
            <div className="grid grid-cols-[20px_36px_52px_1fr_110px_90px_80px_70px_110px_180px] px-4 py-2.5 bg-[#F9F9F9] border-b-2 border-diose-black items-center gap-2">
              <span />
              <input
                type="checkbox"
                className="w-3.5 h-3.5 cursor-pointer accent-diose-black"
                checked={
                  pageRows.length > 0 &&
                  pageRows.every((r) =>
                    r.kind === "single" ? selectedIds.has(r.product.id) : r.members.every((m) => selectedIds.has(m.id))
                  )
                }
                onChange={toggleSelectPage}
              />
              {["Img", "Nombre / SKU", "Categoría", "Marca", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                <span key={h} className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                  {h}
                </span>
              ))}
            </div>

            {!canReorder && (
              <div className="px-4 py-1.5 bg-diose-amber/5 border-b border-diose-border-light text-[11px] text-gray-500">
                Quita los filtros y la búsqueda para poder reordenar arrastrando.
              </div>
            )}

            {(() => {
              function rowCategoryOf(r: ProductRow) {
                return r.kind === "single" ? r.product.category : r.members[0].category;
              }
              let lastCategory: string | null = null;

              return pageRows.map((row, rowIndex) => {
                const rowCategory = rowCategoryOf(row);
                const categoryHeader = rowCategory !== lastCategory && (
                  <div className="px-4 py-1.5 bg-diose-gray/60 border-b border-diose-border-light text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    {rowCategory}
                  </div>
                );
                lastCategory = rowCategory;

                if (row.kind === "single") {
                  const p = row.product;
                  return (
                    <div key={p.id}>
                      {categoryHeader}
                      <div
                        draggable={canReorder && !savingOrder}
                    onDragStart={() => setDraggingRowIndex(rowIndex)}
                    onDragOver={(e) => {
                      if (!canReorder) return;
                      e.preventDefault();
                      if (dragOverRowIndex !== rowIndex) setDragOverRowIndex(rowIndex);
                    }}
                    onDragLeave={() => setDragOverRowIndex((cur) => (cur === rowIndex ? null : cur))}
                    onDrop={(e) => {
                      if (!canReorder) return;
                      e.preventDefault();
                      if (draggingRowIndex !== null) moveTopLevelRow(draggingRowIndex, rowIndex);
                      setDraggingRowIndex(null);
                      setDragOverRowIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggingRowIndex(null);
                      setDragOverRowIndex(null);
                    }}
                    className={`grid grid-cols-[20px_36px_52px_1fr_110px_90px_80px_70px_110px_180px] px-4 py-2.5 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA] ${
                      p.stockStatus === "AGOTADO" ? "opacity-70" : ""
                    } ${draggingRowIndex === rowIndex ? "opacity-40" : ""} ${
                      dragOverRowIndex === rowIndex && draggingRowIndex !== rowIndex ? "bg-diose-amber/10" : ""
                    }`}
                  >
                    <span
                      className={`text-gray-300 select-none text-center ${canReorder ? "cursor-grab active:cursor-grabbing" : "opacity-0"}`}
                      title="Arrastra para reordenar"
                    >
                      ⠿
                    </span>
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 cursor-pointer accent-diose-black"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
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
                      {p.subcategory && <span className="text-gray-400"> · {p.subcategory}</span>}
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
                    <div className="flex gap-2.5 items-center">
                      <span onClick={() => openEdit(p)} className="text-xs text-gray-600 underline cursor-pointer">
                        Editar
                      </span>
                      <span onClick={() => openDuplicate(p)} className="text-xs text-gray-400 underline cursor-pointer hover:text-diose-black">
                        Duplicar
                      </span>
                      <span
                        onClick={() => setConfirmProductId(p.id)}
                        className="text-xs text-gray-300 cursor-pointer hover:text-diose-danger"
                      >
                        ✕
                      </span>
                    </div>
                  </div>
                  </div>
                );
              }

              const { groupId, members } = row;
              const head = members[0];
              const expanded = expandedGroups.has(groupId);
              const prices = members.map((m) => m.price);
              const priceLabel =
                Math.min(...prices) === Math.max(...prices)
                  ? `$${prices[0].toLocaleString("es-MX")}`
                  : `desde $${Math.min(...prices).toLocaleString("es-MX")}`;
              const totalStock = members.reduce((sum, m) => sum + m.stock, 0);
              const groupStatus = deriveStockStatus(totalStock);
              const image = members.find((m) => m.images?.[0])?.images?.[0];

              return (
                <div key={groupId}>
                  {categoryHeader}
                  <div
                    draggable={canReorder && !savingOrder}
                    onDragStart={() => setDraggingRowIndex(rowIndex)}
                    onDragOver={(e) => {
                      if (!canReorder) return;
                      e.preventDefault();
                      if (dragOverRowIndex !== rowIndex) setDragOverRowIndex(rowIndex);
                    }}
                    onDragLeave={() => setDragOverRowIndex((cur) => (cur === rowIndex ? null : cur))}
                    onDrop={(e) => {
                      if (!canReorder) return;
                      e.preventDefault();
                      if (draggingRowIndex !== null) moveTopLevelRow(draggingRowIndex, rowIndex);
                      setDraggingRowIndex(null);
                      setDragOverRowIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggingRowIndex(null);
                      setDragOverRowIndex(null);
                    }}
                    className={`grid grid-cols-[20px_36px_52px_1fr_110px_90px_80px_70px_110px_180px] px-4 py-2.5 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA] bg-diose-gray/40 ${
                      draggingRowIndex === rowIndex ? "opacity-40" : ""
                    } ${dragOverRowIndex === rowIndex && draggingRowIndex !== rowIndex ? "bg-diose-amber/10" : ""}`}
                  >
                    <span
                      className={`text-gray-300 select-none text-center ${canReorder ? "cursor-grab active:cursor-grabbing" : "opacity-0"}`}
                      title="Arrastra para reordenar"
                    >
                      ⠿
                    </span>
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 cursor-pointer accent-diose-black"
                      checked={members.every((m) => selectedIds.has(m.id))}
                      onChange={() => toggleSelectGroup(members)}
                    />
                    <div
                      className="w-10 h-10 bg-[#F0F0F0] flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ backgroundImage: "radial-gradient(#DCDCDC 1px,transparent 1px)", backgroundSize: "10px 10px" }}
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={head.name} className="w-full h-full object-cover" />
                      ) : (
                        <ProductIcon icon={head.icon} size={16} />
                      )}
                    </div>
                    <button
                      onClick={() => toggleGroup(groupId)}
                      className="flex items-center gap-2 cursor-pointer text-left"
                    >
                      <span className={`text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
                      <div>
                        <div className="text-[13px] font-medium text-diose-black flex items-center gap-1.5">
                          {head.name}
                          <span className="text-[10px] font-semibold text-diose-amber bg-diose-amber/10 px-1.5 py-0.5 rounded-sm shrink-0">
                            {members.length} medidas
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-300 mt-0.5">
                          {expanded ? "Ocultar medidas" : "Ver medidas"}
                        </div>
                      </div>
                    </button>
                    <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 inline-block w-fit">
                      {head.category}
                      {head.subcategory && <span className="text-gray-400"> · {head.subcategory}</span>}
                    </span>
                    <span className="text-xs text-gray-600">{head.brand}</span>
                    <span className="text-[13px] font-semibold text-diose-black">{priceLabel}</span>
                    <span className="text-[13px] text-gray-700">{totalStock} uds</span>
                    <StatusTag status={groupStatus} />
                    <div className="flex gap-2.5 items-center">
                      <span onClick={() => openEdit(head)} className="text-xs text-gray-600 underline cursor-pointer">
                        Editar
                      </span>
                    </div>
                  </div>

                  {expanded &&
                    members.map((p) => (
                      <div
                        key={p.id}
                        className={`grid grid-cols-[20px_36px_52px_1fr_110px_90px_80px_70px_110px_180px] px-4 py-2.5 border-b border-gray-100 items-center gap-2 hover:bg-[#FAFAFA] pl-2 ${
                          p.stockStatus === "AGOTADO" ? "opacity-70" : ""
                        }`}
                      >
                        <span />
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 cursor-pointer accent-diose-black"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                        <div />
                        <div className="pl-5 border-l-2 border-diose-border-light ml-1.5">
                          <div className="text-[13px] font-medium text-diose-black flex items-center gap-1.5">
                            {p.variantLabel && (
                              <span className="text-[10px] font-semibold text-diose-amber bg-diose-amber/10 px-1.5 py-0.5 rounded-sm shrink-0">
                                {p.variantLabel}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-300 mt-0.5">SKU-{p.sku}</div>
                        </div>
                        <span />
                        <span />
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
                        <div className="flex gap-2.5 items-center">
                          <span onClick={() => openEdit(p)} className="text-xs text-gray-600 underline cursor-pointer">
                            Editar
                          </span>
                          <span onClick={() => openDuplicate(p)} className="text-xs text-gray-400 underline cursor-pointer hover:text-diose-black">
                            Duplicar
                          </span>
                          <span
                            onClick={() => setConfirmProductId(p.id)}
                            className="text-xs text-gray-300 cursor-pointer hover:text-diose-danger"
                          >
                            ✕
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              );
              });
            })()}

            {pageRows.length === 0 && (
              <div className="px-4 py-10 text-center text-xs text-gray-400">No se encontraron productos.</div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <span className="text-xs text-gray-400">
            Mostrando {pageRows.length} de {groupedRows.length} ({filtered.length} productos en total)
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
          <div
            className={`bg-white w-full p-7 max-h-[90vh] overflow-y-auto transition-[max-width] ${
              hasVariants ? "max-w-3xl" : "max-w-lg"
            }`}
          >
            <div className="font-heading text-lg text-diose-black mb-5">
              {form.id ? "Editar producto" : isDuplicating ? "Duplicar producto" : "Añadir producto"}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                  {hasVariants ? "Nombre de familia" : "Nombre"}
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={hasVariants ? "Ej: Tornillo Hexagonal 1/4" : undefined}
                  list={hasVariants ? "variant-groups" : undefined}
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
                {hasVariants && (
                  <datalist id="variant-groups">
                    {variantGroups.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                )}
              </label>

              <div className="col-span-2 flex items-center justify-between gap-3 border border-diose-border-light bg-diose-gray px-3.5 py-3">
                <div>
                  <div className="text-xs font-semibold text-diose-black">
                    Este producto tiene variantes (tallas o medidas)
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Actívalo para tornillería u otros productos con varios tamaños bajo un mismo nombre — cada
                    medida tendrá su propio SKU, precio, stock y cantidad mínima.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasVariants((v) => !v)}
                  aria-pressed={hasVariants}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
                    hasVariants ? "bg-diose-amber" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      hasVariants ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

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
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Peso (kg) — para calcular envío</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="Ej: 19"
                  className="border border-diose-border px-3 py-2 text-sm outline-none"
                />
              </label>
              <CreatableSelect
                label="Categoría"
                itemLabel="categoría"
                value={form.categoryId}
                options={allCategories}
                onChange={(id) => setForm((f) => ({ ...f, categoryId: id, subcategoryName: "" }))}
                onCreate={async (name) => {
                  const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return { error: data.error ?? "No se pudo crear la categoría." };
                  setExtraCategories((prev) => [...prev, { id: data.id, name: data.name }]);
                  router.refresh();
                  return { id: data.id, name: data.name };
                }}
              />
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Subcategoría (opcional)</span>
                <input
                  value={form.subcategoryName}
                  onChange={(e) => setForm({ ...form, subcategoryName: e.target.value })}
                  placeholder="Ej: Grado 8 — escribe una nueva o elige una existente"
                  list="subcategory-options"
                  className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
                />
                <datalist id="subcategory-options">
                  {subcategories
                    .filter((s) => s.categoryId === form.categoryId)
                    .map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                </datalist>
              </label>
              <CreatableSelect
                label="Marca"
                itemLabel="marca"
                value={form.brandId}
                options={allBrands}
                onChange={(id) => setForm((f) => ({ ...f, brandId: id }))}
                onCreate={async (name) => {
                  const res = await fetch("/api/brands", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return { error: data.error ?? "No se pudo crear la marca." };
                  setExtraBrands((prev) => [...prev, { id: data.id, name: data.name }]);
                  router.refresh();
                  return { id: data.id, name: data.name };
                }}
              />

              {/tornill/i.test(allCategories.find((c) => c.id === form.categoryId)?.name ?? "") && (
                <div className="col-span-2 border border-diose-amber/40 bg-diose-amber/5 p-3 flex flex-col gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-diose-amber">
                    Tornillería — grosor / diámetro
                  </div>
                  <div className="text-[11px] text-gray-500 -mt-1">
                    Aplica a toda la familia (todas las medidas de largo comparten el mismo grosor). Se muestra
                    como un círculo a escala en la ficha del producto.
                  </div>
                  <select
                    value={form.diameterLabel}
                    onChange={(e) => setForm({ ...form, diameterLabel: e.target.value })}
                    className="border border-diose-border px-3 py-2 text-sm outline-none bg-white w-1/2"
                  >
                    <option value="">Sin especificar</option>
                    {INCH_FRACTION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!hasVariants ? (
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">SKU</span>
                    <input
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="border border-diose-border px-3 py-2 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Precio</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="border border-diose-border px-3 py-2 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Stock</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="border border-diose-border px-3 py-2 text-sm outline-none"
                    />
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
                  <div className="col-span-2 border border-diose-border-light bg-diose-gray p-3 flex flex-col gap-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                      Venta por mínimo o paquete (opcional)
                    </div>
                    <div className="text-[11px] text-gray-400 -mt-1.5">
                      Obliga a comprar en múltiplos de una cantidad, o véndelo por bolsa/caja en vez de por pieza
                      suelta.
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Cantidad mínima / múltiplo</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={form.minOrderQty}
                          onChange={(e) => setForm({ ...form, minOrderQty: e.target.value })}
                          className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Etiqueta de venta (opcional)</span>
                        <input
                          value={form.packLabel}
                          onChange={(e) => setForm({ ...form, packLabel: e.target.value })}
                          placeholder="Ej: Bolsa de 100 piezas"
                          className="border border-diose-border px-3 py-2 text-sm outline-none bg-white"
                        />
                      </label>
                    </div>
                    {Number(form.price) > 0 && Number(form.minOrderQty) > 1 && (
                      <div className="text-[11px] text-diose-black bg-diose-amber/10 border border-diose-amber/30 px-2.5 py-1.5">
                        <strong>${(Number(form.price) * Number(form.minOrderQty)).toLocaleString("es-MX")}</strong> es
                        lo que pagará el cliente por el mínimo de {form.minOrderQty} piezas (${form.price} c/u). Si
                        ese total no es el precio real del paquete, ajusta el precio por pieza arriba.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="col-span-2 flex flex-col gap-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                    Medidas de &quot;{form.name.trim() || "..."}&quot;{" "}
                    <span className="normal-case text-gray-300">— arrastra ⠿ para reordenar</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase tracking-[0.1em] text-gray-400">
                      Tamaños comunes — clic para añadir
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {INCH_FRACTION_OPTIONS.map((label) => {
                        const used = variantRows.some((r) => r.variantLabel.trim() === label);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => addQuickVariantLabel(label)}
                            disabled={used}
                            className={`text-xs px-2.5 py-1 border cursor-pointer ${
                              used
                                ? "border-diose-border-light text-gray-300 cursor-not-allowed"
                                : "border-diose-border text-gray-700 hover:border-diose-amber hover:text-diose-amber"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase tracking-[0.1em] text-gray-400">
                      O pega varias de una vez (separadas por coma o renglón)
                    </span>
                    <div className="flex gap-1.5">
                      <textarea
                        value={bulkLabelsText}
                        onChange={(e) => setBulkLabelsText(e.target.value)}
                        placeholder={'Ej: 1/2", 3/4", 1", 1-1/4"'}
                        rows={1}
                        className="flex-1 border border-diose-border px-2.5 py-1.5 text-xs outline-none min-w-0 resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addBulkVariantLabels(bulkLabelsText);
                          setBulkLabelsText("");
                        }}
                        disabled={!bulkLabelsText.trim()}
                        className="text-xs px-3 border border-diose-black bg-diose-black text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  <div className="border border-diose-border overflow-hidden">
                    <div className="grid grid-cols-[20px_1fr_1fr_90px_70px_90px_78px] gap-1.5 px-2.5 py-2 bg-[#F9F9F9] border-b border-diose-border-light">
                      {["", "Etiqueta", "SKU", "Precio", "Stock", "Mín.", ""].map((h, hi) => (
                        <span key={hi} className="text-[9px] font-semibold tracking-[0.1em] uppercase text-gray-400">
                          {h}
                        </span>
                      ))}
                    </div>
                    {variantRows.map((row, i) => (
                      <div
                        key={i}
                        draggable
                        onDragStart={() => setDraggingIndex(i)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverIndex !== i) setDragOverIndex(i);
                        }}
                        onDragLeave={() => setDragOverIndex((cur) => (cur === i ? null : cur))}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggingIndex !== null) moveVariantRow(draggingIndex, i);
                          setDraggingIndex(null);
                          setDragOverIndex(null);
                        }}
                        onDragEnd={() => {
                          setDraggingIndex(null);
                          setDragOverIndex(null);
                        }}
                        className={`grid grid-cols-[20px_1fr_1fr_90px_70px_90px_78px] gap-1.5 px-2.5 py-1.5 border-b border-gray-100 last:border-b-0 items-center ${
                          draggingIndex === i ? "opacity-40" : ""
                        } ${dragOverIndex === i && draggingIndex !== i ? "bg-diose-amber/10" : ""}`}
                      >
                        <span
                          className="text-gray-300 cursor-grab active:cursor-grabbing select-none text-center"
                          title="Arrastra para reordenar"
                        >
                          ⠿
                        </span>
                        <input
                          value={row.variantLabel}
                          onChange={(e) => updateVariantRow(i, { variantLabel: e.target.value })}
                          placeholder='1", 1-1/2"...'
                          className="border border-diose-border px-2 py-1.5 text-xs outline-none min-w-0"
                        />
                        <input
                          value={row.sku}
                          onChange={(e) => updateVariantRow(i, { sku: e.target.value })}
                          placeholder="SKU"
                          className="border border-diose-border px-2 py-1.5 text-xs outline-none min-w-0"
                        />
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => updateVariantRow(i, { price: e.target.value })}
                          placeholder="$"
                          className="border border-diose-border px-2 py-1.5 text-xs outline-none min-w-0"
                        />
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.stock}
                          onChange={(e) => updateVariantRow(i, { stock: e.target.value })}
                          className="border border-diose-border px-2 py-1.5 text-xs outline-none min-w-0"
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={row.minOrderQty}
                            onChange={(e) => updateVariantRow(i, { minOrderQty: e.target.value })}
                            className="border border-diose-border px-2 py-1.5 text-xs outline-none min-w-0 w-full"
                          />
                          {Number(row.price) > 0 && Number(row.minOrderQty) > 1 && (
                            <span className="text-[9px] text-diose-amber leading-tight" title="Precio × cantidad mínima">
                              = ${(Number(row.price) * Number(row.minOrderQty)).toLocaleString("es-MX")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => moveVariantRow(i, i - 1)}
                            disabled={i === 0}
                            title="Subir"
                            className="text-gray-300 hover:text-diose-black cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveVariantRow(i, i + 1)}
                            disabled={i === variantRows.length - 1}
                            title="Bajar"
                            className="text-gray-300 hover:text-diose-black cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariantRow(i)}
                            disabled={variantRows.length <= 1}
                            className="text-gray-300 hover:text-diose-danger cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-sm ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="self-start text-xs font-semibold text-diose-amber underline cursor-pointer"
                  >
                    + Agregar medida
                  </button>
                </div>
              )}

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
                  Especificaciones <span className="normal-case text-gray-300">(una por línea — aparecen debajo de la imagen)</span>
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
            {formError && <p className="text-xs text-diose-danger mt-4">{formError}</p>}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs text-gray-600 border border-diose-border cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={
                  saving ||
                  !form.name ||
                  !form.categoryId ||
                  !form.brandId ||
                  (hasVariants ? variantRows.length === 0 : !form.sku)
                }
                className="bg-diose-amber hover:bg-diose-amber-dark text-white px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmProductId && (
        <ConfirmModal
          message="¿Eliminar este producto? No se puede deshacer."
          onConfirm={() => { const id = confirmProductId; setConfirmProductId(null); removeProduct(id); }}
          onCancel={() => setConfirmProductId(null)}
        />
      )}
      {confirmBulkDelete && (
        <ConfirmModal
          message={`¿Eliminar ${selectedIds.size} producto(s) seleccionado(s)? No se puede deshacer. Los que tengan pedidos asociados no se eliminarán.`}
          onConfirm={() => { setConfirmBulkDelete(false); bulkDelete(); }}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}
    </>
  );
}
