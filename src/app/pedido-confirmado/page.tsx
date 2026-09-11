import Link from "next/link";
import Logo from "@/components/Logo";
import { getSiteSettings, getOrderConfirmationInfo } from "@/lib/data";
import { formatPrice } from "@/lib/currency";
import ComprobanteUploader from "./ComprobanteUploader";

function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-[0.08em]">{label}</p>
      <p className={`text-sm font-medium text-diose-black select-all ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-5 h-5 rounded-full bg-diose-black text-white text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <p className="text-sm text-diose-black">{children}</p>
    </div>
  );
}

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; metodo?: string; id?: string }>;
}) {
  const { n: number, metodo, id } = await searchParams;
  const isTransfer = metodo === "transferencia";
  const [settings, order] = await Promise.all([
    isTransfer ? getSiteSettings() : null,
    isTransfer && id ? getOrderConfirmationInfo(id) : null,
  ]);
  const hasBankInfo = !!settings?.bankClabe;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 text-center py-16">
      <Link href="/">
        <Logo invert />
      </Link>

      <div className="mt-10 w-16 h-16 rounded-full bg-diose-success/10 border-2 border-diose-success flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="mt-6 font-heading text-4xl text-diose-black tracking-[0.04em]">
        ¡Pedido confirmado!
      </h1>

      {number && (
        <p className="mt-2 text-sm text-gray-500">
          Número de pedido: <span className="font-semibold text-diose-black">#{number}</span>
        </p>
      )}

      <p className="mt-4 text-sm text-gray-500 max-w-sm">
        Recibimos tu pedido. Nos pondremos en contacto contigo en breve para coordinar el pago y la entrega.
      </p>

      {isTransfer && hasBankInfo && (
        <div className="mt-8 w-full max-w-sm bg-white border border-diose-border text-left overflow-hidden">
          <div className="bg-diose-black px-6 py-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/50">Paga por SPEI</p>
            <p className="text-2xl font-heading tracking-[0.02em] text-white mt-0.5">
              {order ? formatPrice(order.total) : ""}
            </p>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {settings?.bankName && <CopyRow label="Banco" value={settings.bankName} />}
              {settings?.bankHolder && <CopyRow label="Titular" value={settings.bankHolder} />}
              <CopyRow label="CLABE interbancaria" value={settings?.bankClabe ?? ""} mono />
              {settings?.bankAccountNumber && (
                <CopyRow label="Número de cuenta" value={settings.bankAccountNumber} mono />
              )}
            </div>

            <div className="border-t border-diose-border-light pt-4 flex flex-col gap-2.5">
              <Step n={1}>
                Transfiere {order ? <strong>{formatPrice(order.total)}</strong> : "el total de tu pedido"} vía SPEI a
                la CLABE de arriba.
              </Step>
              <Step n={2}>
                Usa <strong>#{number}</strong> como concepto o referencia de la transferencia.
              </Step>
              <Step n={3}>Sube tu comprobante abajo — así confirmamos tu pedido más rápido.</Step>
            </div>

            {id && order?.status === "PENDIENTE" && !order.comprobanteUrl && <ComprobanteUploader orderId={id} />}
            {order?.comprobanteUrl && (
              <div className="mt-1 bg-green-50 border border-green-200 px-3.5 py-3 text-xs text-green-700 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Ya recibimos tu comprobante — estamos verificando tu pago.
              </div>
            )}
          </div>
        </div>
      )}

      {isTransfer && !hasBankInfo && (
        <p className="mt-4 text-xs text-gray-400 max-w-sm">
          Te contactaremos por WhatsApp o correo con los datos para tu transferencia SPEI.
        </p>
      )}

      {metodo === "efectivo" && number && (
        <p className="mt-2 text-xs text-gray-400 max-w-sm">
          Pasa a pagar en efectivo a nuestra sucursal y menciona tu número de pedido <strong>#{number}</strong>.
        </p>
      )}

      <div className="mt-8 flex gap-3 flex-wrap justify-center">
        <Link
          href="/cuenta"
          className="bg-diose-black text-white px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/catalogo"
          className="border border-diose-black text-diose-black px-7 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
