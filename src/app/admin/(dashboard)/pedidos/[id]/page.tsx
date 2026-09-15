import { notFound } from "next/navigation";
import Link from "next/link";
import OrderStatusPanel from "./OrderStatusPanel";
import { getOrderById } from "@/lib/data";
import { formatPrice } from "@/lib/currency";
import { shippingGuidance, TRES_GUERRAS_ORIGIN_CP, TRES_GUERRAS_COTIZADOR_URL } from "@/lib/shipping";

export const revalidate = 0;

const STEPS: { key: string; label: string }[] = [
  { key: "PENDIENTE", label: "Pendiente" },
  { key: "CONFIRMADO", label: "Confirmado" },
  { key: "EN_CAMINO", label: "Enviado" },
  { key: "ENTREGADO", label: "Entregado" },
];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const currentStep = STEPS.findIndex((s) => s.key === order.status);
  const shipGuidance = shippingGuidance(order.totalWeightKg, order.customer.city);

  return (
    <>
      <div className="h-14 bg-white border-b border-diose-border-light flex items-center px-9 gap-5 shrink-0">
          <span className="text-xs text-gray-400 tracking-[0.04em] cursor-pointer">← Pedidos</span>
          <span className="text-xs text-gray-300">/</span>
          <span className="font-heading text-xl text-diose-black tracking-[0.06em]">Pedido #{order.number}</span>
          <span className="text-xs text-gray-400">
            · {order.customer.name} · {order.createdAt}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href={`/guia/${order.id}`}
              target="_blank"
              className="text-[10px] border border-diose-black text-diose-black px-3 py-1 tracking-[0.1em] uppercase hover:bg-diose-black hover:text-white transition-colors"
            >
              Generar guía
            </Link>
            {order.invoice && (
              <span className="text-[10px] bg-diose-black text-white px-3 py-1 tracking-[0.1em] uppercase">
                Factura
              </span>
            )}
            <span className="text-[10px] bg-diose-amber/10 text-diose-amber border border-diose-amber px-3 py-1 tracking-[0.1em] uppercase">
              {order.statusLabel}
            </span>
          </div>
        </div>

        {/* Status progress track */}
        <div className="bg-white border-b border-diose-border-light px-9 py-5 shrink-0">
          <div className="flex items-center max-w-2xl">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      i <= currentStep ? "bg-diose-amber" : "border-2 border-gray-200"
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${i <= currentStep ? "bg-white" : "bg-gray-200"}`} />
                  </div>
                  <span
                    className={`text-[11px] tracking-[0.04em] ${
                      i <= currentStep ? "font-semibold text-diose-amber" : "text-gray-300"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 -mt-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT */}
          <div className="flex-1 p-9 flex flex-col gap-5 overflow-y-auto">
            <div className="bg-white border border-diose-border p-6">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3.5">
                Información del cliente
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Nombre" value={order.customer.name} />
                <Field label="Teléfono" value={order.customer.phone || "—"} />
                <Field label="Correo" value={order.customer.email} />
                <Field label="Dirección" value={order.customer.address || "—"} />
              </div>
            </div>

            <div className="bg-white border border-diose-border p-6">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3.5">
                Envío
              </div>

              {shipGuidance.isLocal ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3.5 py-2.5">
                  Entrega local gratis en Ciudad Juárez — no necesitas paquetería para este pedido.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                    <Field label="Peso total del pedido" value={`${order.totalWeightKg} kg`} />
                    <Field label="Envío cobrado al cliente" value={formatPrice(order.shipping)} />
                  </div>

                  {shipGuidance.isEstimate && (
                    <div className="bg-diose-amber/10 border border-diose-amber text-diose-black text-xs px-3.5 py-2.5 mb-4">
                      ⚠️ Este pedido pesa más de 20&nbsp;kg — el precio de arriba es una <strong>estimación</strong>,
                      no un dato confirmado con Tres Guerras. Cotízalo antes de despacharlo para no perder dinero
                      si sale más caro.
                    </div>
                  )}

                  <div className="bg-[#F9F9F9] border border-diose-border-light p-3.5 mb-4">
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                      Cómo despacharlo
                    </p>
                    <ol className="text-xs text-diose-black leading-relaxed list-decimal list-inside space-y-1">
                      <li>
                        Lleva el paquete a la sucursal de <strong>Tres Guerras en Ciudad Juárez</strong> y usa el
                        servicio <strong>&quot;Entrega a domicilio&quot;</strong> (es el más barato — ellos lo
                        entregan en la puerta del cliente).
                      </li>
                      <li>
                        Destino: <strong>{order.customer.city}, {order.customer.state}</strong> — CP{" "}
                        <strong>{order.customer.postalCode || "—"}</strong>
                      </li>
                      <li>
                        Peso a declarar: <strong>{order.totalWeightKg} kg</strong>
                      </li>
                    </ol>
                  </div>

                  <a
                    href={TRES_GUERRAS_COTIZADOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-diose-black hover:bg-diose-amber text-white px-4 py-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors"
                  >
                    Cotizar en Tres Guerras
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </a>
                  <p className="text-[11px] text-gray-400 mt-2">
                    En su cotizador pon CP origen <strong>{TRES_GUERRAS_ORIGIN_CP}</strong> → CP destino{" "}
                    <strong>{order.customer.postalCode || "—"}</strong>, peso <strong>{order.totalWeightKg} kg</strong>.
                  </p>
                </>
              )}
            </div>

            {order.paymentMethod === "TRANSFERENCIA" && (
              <div className="bg-white border border-diose-border p-6">
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3.5">
                  Comprobante de transferencia (SPEI)
                </div>
                {order.comprobanteUrl ? (
                  <a href={order.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="block w-40">
                    <img
                      src={order.comprobanteUrl}
                      alt="Comprobante de pago"
                      className="w-40 border border-diose-border-light object-cover hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                    <span className="text-[11px] text-gray-400 underline mt-1 block">Ver completo</span>
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">El cliente todavía no ha subido su comprobante.</p>
                )}
              </div>
            )}

            {order.invoice && (
              <div className="bg-white border border-diose-amber p-6">
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-diose-amber mb-3.5">
                  Requiere factura (CFDI)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="RFC" value={order.invoice.rfc} />
                  <Field label="CP fiscal" value={order.invoice.zip} />
                  <Field label="Nombre / Razón social" value={order.invoice.name} />
                  <Field label="Régimen fiscal" value={order.invoice.regime} />
                  <Field label="Uso de CFDI" value={order.invoice.cfdiUse} />
                </div>
              </div>
            )}

            <div className="bg-white border border-diose-border overflow-hidden">
              <div className="px-6 py-3.5 border-b border-gray-100 text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                Productos del pedido
              </div>
              {order.items.map((item) => (
                <OrderLine key={item.id} name={item.name} sku={item.sku} qty={item.quantity} price={item.price} image={item.image} />
              ))}
              <div className="bg-[#F9F9F9] px-6 py-3 border-t border-diose-border-light flex justify-between items-center">
                <span className="text-xs text-gray-400">Total del pedido</span>
                <span className="text-lg font-semibold text-diose-black">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <OrderStatusPanel
            orderId={order.id}
            initialStatus={order.status}
            initialNotes={order.internalNotes}
            initialNotify={order.notifyWhatsapp}
            customerPhone={order.customer.phone}
            orderNumber={order.number}
          />
        </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-300 mb-1">{label}</div>
      <div className="text-sm text-diose-black">{value}</div>
    </div>
  );
}

function OrderLine({ name, sku, qty, price, image }: { name: string; sku: string; qty: number; price: string; image?: string | null }) {
  return (
    <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-50 last:border-b-0">
      <div
        className="w-13 h-13 bg-[#F0F0F0] shrink-0 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "radial-gradient(#DCDCDC 1px,transparent 1px)", backgroundSize: "10px 10px" }}
      >
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-diose-black">{name}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          SKU-{sku} · Cantidad: {qty}
        </div>
      </div>
      <div className="text-base font-semibold text-diose-black">{price}</div>
    </div>
  );
}
