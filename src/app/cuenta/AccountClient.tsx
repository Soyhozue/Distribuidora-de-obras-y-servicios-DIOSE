"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMPTY_ADDR = { street: "", city: "Ciudad Juárez", state: "Chihuahua", postalCode: "", isDefault: false };

type Order = {
  number: number;
  date: string;
  products: string;
  total: number;
  status: string;
};

type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

type UserInfo = { name: string; email: string; phone: string | null };

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-MX")}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Confirmado: "bg-diose-black text-white",
    Entregado: "border border-gray-700 text-gray-700",
    Pendiente: "bg-diose-amber text-white",
    Enviado: "bg-diose-amber text-white",
    Cancelado: "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`text-[10px] px-2.5 py-1 tracking-[0.08em] uppercase inline-block ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

const TABS = ["Mis pedidos", "Perfil", "Direcciones", "Configuración"] as const;
type Tab = (typeof TABS)[number];

export default function AccountClient({
  user,
  orders,
  addresses,
}: {
  user: UserInfo;
  orders: Order[];
  addresses: Address[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Mis pedidos");
  const [addrList, setAddrList] = useState<Address[]>(addresses);
  const [showForm, setShowForm] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState("");

  async function saveAddress() {
    if (!addrForm.street || !addrForm.city || !addrForm.state || !addrForm.postalCode) {
      setAddrError("Completa todos los campos."); return;
    }
    setAddrSaving(true); setAddrError("");
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrForm),
      });
      if (!res.ok) { const d = await res.json(); setAddrError(d.error); return; }
      const created = await res.json();
      setAddrList((prev) => addrForm.isDefault
        ? [...prev.map((a) => ({ ...a, isDefault: false })), created]
        : [...prev, created]);
      setAddrForm(EMPTY_ADDR);
      setShowForm(false);
    } finally { setAddrSaving(false); }
  }

  async function deleteAddress(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    setAddrList((prev) => prev.filter((a) => a.id !== id));
  }

  async function setDefault(id: string) {
    await fetch(`/api/addresses/${id}`, { method: "PATCH" });
    setAddrList((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="flex flex-col md:flex-row flex-1">
      <aside className="w-full md:w-62 bg-[#F9F9F9] border-b md:border-b-0 md:border-r border-diose-border-light p-7 shrink-0">
        <div className="flex items-center gap-3.5 mb-9">
          <div className="w-12 h-12 bg-diose-black rounded-full flex items-center justify-center shrink-0">
            <span className="text-base font-semibold text-white">{initials}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-diose-black">{user.name}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{user.email}</div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          {TABS.map((t) => (
            <div
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer ${tab === t ? "bg-diose-black" : ""}`}
            >
              <span className={`text-[13px] tracking-[0.04em] ${tab === t ? "text-white font-medium" : "text-gray-600"}`}>
                {t}
              </span>
            </div>
          ))}
          <div className="h-px bg-diose-border-light my-3" />
          <div onClick={logout} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer">
            <span className="text-[13px] text-gray-300 tracking-[0.04em] hover:text-diose-danger">Cerrar sesión</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:px-13 md:py-9 overflow-x-auto">
        {tab === "Mis pedidos" && (
          <>
            <div className="mb-7">
              <h2 className="font-heading text-3xl text-diose-black tracking-[0.04em] mb-1">Mis pedidos</h2>
              <span className="text-xs text-gray-400 tracking-[0.04em]">Historial de compras</span>
            </div>
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[80px_120px_1fr_100px_120px] border-b-2 border-diose-black pb-2.5">
                {["Pedido", "Fecha", "Productos", "Total", "Estado"].map((h) => (
                  <span key={h} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                    {h}
                  </span>
                ))}
              </div>
              {orders.map((order) => (
                <div
                  key={order.number}
                  className={`grid grid-cols-[80px_120px_1fr_100px_120px] border-b border-gray-100 py-3.5 items-center ${
                    order.status === "Cancelado" ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-[13px] font-semibold text-diose-black">{order.number}</span>
                  <span className="text-[13px] text-gray-500">{order.date}</span>
                  <span className="text-[13px] text-gray-500 truncate pr-4">{order.products}</span>
                  <span className="text-[13px] font-semibold text-diose-black">{formatPrice(order.total)}</span>
                  <StatusBadge status={order.status} />
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-16">Todavía no tienes pedidos.</div>
              )}
            </div>
          </>
        )}

        {tab === "Perfil" && (
          <>
            <div className="mb-7">
              <h2 className="font-heading text-3xl text-diose-black tracking-[0.04em] mb-1">Perfil</h2>
              <span className="text-xs text-gray-400 tracking-[0.04em]">Tus datos personales</span>
            </div>
            <div className="max-w-md flex flex-col gap-4">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">Nombre</div>
                <div className="text-sm text-diose-black border border-diose-border-light px-3.5 py-2.5">{user.name}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">Correo</div>
                <div className="text-sm text-diose-black border border-diose-border-light px-3.5 py-2.5">{user.email}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">Teléfono</div>
                <div className="text-sm text-diose-black border border-diose-border-light px-3.5 py-2.5">
                  {user.phone || "—"}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "Direcciones" && (
          <>
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="font-heading text-3xl text-diose-black tracking-[0.04em] mb-1">Direcciones</h2>
                <span className="text-xs text-gray-400 tracking-[0.04em]">Tus direcciones de envío guardadas</span>
              </div>
              {!showForm && (
                <button
                  onClick={() => { setShowForm(true); setAddrError(""); }}
                  className="bg-diose-black hover:bg-diose-amber text-white px-5 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase cursor-pointer transition-colors"
                >
                  + Añadir dirección
                </button>
              )}
            </div>

            {showForm && (
              <div className="border border-diose-border p-5 mb-6 max-w-md">
                <div className="font-heading text-base text-diose-black tracking-[0.04em] mb-4">Nueva dirección</div>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Calle y número</span>
                    <input value={addrForm.street} onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))}
                      placeholder="Av. de las Torres 1234, Col. Industrial"
                      className="border border-diose-border px-3.5 py-2.5 text-sm outline-none focus:border-diose-black" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Ciudad</span>
                      <input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                        className="border border-diose-border px-3.5 py-2.5 text-sm outline-none focus:border-diose-black" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Estado</span>
                      <input value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                        className="border border-diose-border px-3.5 py-2.5 text-sm outline-none focus:border-diose-black" />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Código postal</span>
                    <input value={addrForm.postalCode} onChange={(e) => setAddrForm((f) => ({ ...f, postalCode: e.target.value }))}
                      placeholder="32000"
                      className="border border-diose-border px-3.5 py-2.5 text-sm outline-none focus:border-diose-black" />
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addrForm.isDefault}
                      onChange={(e) => setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))} />
                    <span className="text-xs text-gray-600">Usar como dirección predeterminada</span>
                  </label>
                  {addrError && <p className="text-xs text-red-500">{addrError}</p>}
                  <div className="flex gap-2 mt-1">
                    <button onClick={saveAddress} disabled={addrSaving}
                      className="flex-1 bg-diose-black hover:bg-diose-amber text-white py-2.5 text-xs font-semibold tracking-[0.08em] uppercase cursor-pointer disabled:opacity-50 transition-colors">
                      {addrSaving ? "Guardando..." : "Guardar dirección"}
                    </button>
                    <button onClick={() => { setShowForm(false); setAddrForm(EMPTY_ADDR); setAddrError(""); }}
                      className="px-4 py-2.5 text-xs border border-diose-border text-gray-600 hover:border-diose-black cursor-pointer">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 max-w-md">
              {addrList.map((a) => (
                <div key={a.id} className={`border p-4 ${a.isDefault ? "border-diose-black" : "border-diose-border-light"}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-sm font-medium text-diose-black">{a.street}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{a.city}, {a.state} · CP {a.postalCode}</div>
                      {a.isDefault && (
                        <span className="text-[10px] text-diose-amber uppercase tracking-[0.08em] mt-1.5 inline-block font-semibold">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {!a.isDefault && (
                        <button onClick={() => setDefault(a.id)}
                          className="text-[11px] text-gray-500 hover:text-diose-black cursor-pointer underline underline-offset-2">
                          Predeterminar
                        </button>
                      )}
                      <button onClick={() => deleteAddress(a.id)}
                        className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {addrList.length === 0 && !showForm && (
                <div className="text-center text-gray-400 text-sm py-16">
                  Aún no tienes direcciones guardadas.
                </div>
              )}
            </div>
          </>
        )}

        {tab === "Configuración" && (
          <>
            <div className="mb-7">
              <h2 className="font-heading text-3xl text-diose-black tracking-[0.04em] mb-1">Configuración</h2>
              <span className="text-xs text-gray-400 tracking-[0.04em]">Preferencias de la cuenta</span>
            </div>
            <button
              onClick={logout}
              className="border border-diose-border-light px-5 py-3 text-sm text-diose-danger cursor-pointer hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </main>
    </div>
  );
}
