function VisaBadge() {
  return (
    <div className="w-11 h-7 rounded bg-white flex items-center justify-center shrink-0" title="Visa">
      <svg width="30" height="12" viewBox="0 0 30 12" xmlns="http://www.w3.org/2000/svg">
        <text
          x="15"
          y="10"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontStyle="italic"
          fontWeight="800"
          fontSize="12"
          fill="#1A1F71"
          letterSpacing="-0.5"
        >
          VISA
        </text>
      </svg>
    </div>
  );
}

function MastercardBadge() {
  return (
    <div className="w-11 h-7 rounded bg-white flex items-center justify-center shrink-0" title="Mastercard">
      <svg width="26" height="16" viewBox="0 0 26 16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="8" fill="#EB001B" />
        <circle cx="17" cy="8" r="8" fill="#F79E1B" />
        <path d="M13 1.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4Z" fill="#FF5F00" />
      </svg>
    </div>
  );
}

function AmexBadge() {
  return (
    <div className="w-11 h-7 rounded bg-[#006FCF] flex items-center justify-center shrink-0" title="American Express">
      <span className="text-white text-[8px] font-bold tracking-tight">AMEX</span>
    </div>
  );
}

export default function PaymentBadges() {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40">
        Aceptamos
      </span>
      <div className="flex items-center gap-2">
        <VisaBadge />
        <MastercardBadge />
        <AmexBadge />
      </div>
      <span className="text-[11px] text-white/30">
        Pagos con tarjeta procesados de forma segura por Mercado Pago
      </span>
    </div>
  );
}
