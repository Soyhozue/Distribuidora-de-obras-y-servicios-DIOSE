import Link from "next/link";
import Logo from "@/components/Logo";
import { getSiteSettings } from "@/lib/data";

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; metodo?: string }>;
}) {
  const { n: number, metodo } = await searchParams;
  const settings = metodo === "transferencia" ? await getSiteSettings() : null;
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

      {metodo === "transferencia" && hasBankInfo && (
        <div className="mt-8 w-full max-w-sm bg-white border border-diose-border p-6 text-left">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-4">
            Datos para tu transferencia
          </p>
          <div className="flex flex-col gap-3">
            {settings?.bankName && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.08em]">Banco</p>
                <p className="text-sm font-medium text-diose-black">{settings.bankName}</p>
              </div>
            )}
            {settings?.bankHolder && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.08em]">Titular</p>
                <p className="text-sm font-medium text-diose-black">{settings.bankHolder}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.08em]">CLABE interbancaria</p>
              <p className="text-sm font-mono font-medium text-diose-black select-all">{settings?.bankClabe}</p>
            </div>
          </div>
          {number && (
            <div className="mt-4 bg-diose-amber/10 border border-diose-amber/30 px-3 py-2.5 text-xs text-diose-black">
              Importante: pon <strong>#{number}</strong> como concepto o referencia de tu transferencia — así
              podemos identificar tu pago y confirmar tu pedido más rápido.
            </div>
          )}
        </div>
      )}

      {metodo === "transferencia" && !hasBankInfo && (
        <p className="mt-4 text-xs text-gray-400 max-w-sm">
          Te contactaremos por WhatsApp o correo con los datos para tu transferencia.
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
