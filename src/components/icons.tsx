type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function SearchIcon({ size = 18, color = "#070707", strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function CartIcon({ size = 18, color = "#070707", strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

export function UserIcon({ size = 18, color = "#070707", strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 22, color = "#fff", strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

export function TruckIcon({ size = 22, color = "#1d5fb8", strokeWidth = 1.6, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 3h14v13H1z" />
      <path d="M15 8h4l3 3v5h-7V8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 22, color = "#1d5fb8", strokeWidth = 1.6, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l8 3.5v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6L12 2z" />
      <path d="M8.5 12l2.5 2.5 5-5" />
    </svg>
  );
}

export function HeadsetIcon({ size = 22, color = "#1d5fb8", strokeWidth = 1.6, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 13a9 9 0 0118 0" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v1a3 3 0 01-3 3h-3" />
    </svg>
  );
}

export function LockIcon({ size = 22, color = "#1d5fb8", strokeWidth = 1.6, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}

export function PinIcon({ size = 15, color = "#555", strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function PhoneIcon({ size = 15, color = "#555", strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

export function MailIcon({ size = 15, color = "#555", strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 10, color = "#666", strokeWidth = 2.5, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" className={className}>
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

export function CloseIcon({ size = 16, color = "#CCCCCC", strokeWidth = 2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function DrillIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function BagIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

export function PaintIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function WrenchIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  );
}

export function CableIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="5,3 19,3" />
      <polyline points="5,21 19,21" />
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

export function HoseIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 3H3v7a6 6 0 006 6h6a6 6 0 006-6V3z" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function RodIcon({ size = 40, color = "#C8C8C8", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function CementIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

export function CircleAlertIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function FireIcon({ size = 40, color = "#C0C0C0", strokeWidth = 1.2, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// Ilustraciones a color para categorías reales del catálogo — cada una con
// su propia paleta (no un solo trazo monocromo tintado), para que se
// reconozca la categoría de un vistazo en las fichas circulares del inicio.

export function BoltIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <rect x="17" y="16" width="6" height="19" rx="1" fill="#2b2b2e" />
      <rect x="17" y="19" width="6" height="1.6" fill="#0f0f10" />
      <rect x="17" y="23" width="6" height="1.6" fill="#0f0f10" />
      <rect x="17" y="27" width="6" height="1.6" fill="#0f0f10" />
      <rect x="17" y="31" width="6" height="1.6" fill="#0f0f10" />
      <path d="M20 5l10.4 6v12L20 29 9.6 23V11z" fill="#c7cdd4" />
      <path d="M20 5l10.4 6-10.4 6-10.4-6z" fill="#eef1f4" />
      <path d="M20 17l10.4-6v12L20 29z" fill="#9aa1aa" />
      <circle cx="20" cy="17" r="4.2" fill="#5b6169" />
      <circle cx="20" cy="17" r="4.2" fill="none" stroke="#3d4148" strokeWidth="0.6" />
    </svg>
  );
}

export function SafetyHelmetIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <ellipse cx="20" cy="29.5" rx="15" ry="3" fill="#e4a900" />
      <path d="M6 28c0-9.4 6.3-16.5 14-16.5S34 18.6 34 28z" fill="#ffc600" />
      <path d="M20 11.5c-1 0-2 .07-2.9.2C18 15 18.6 21 19.3 28h1.4c.7-7 1.3-13 1.2-16.3-.9-.13-1.9-.2-2.9-.2z" fill="#ffe066" />
      <rect x="4.5" y="26.5" width="31" height="4" rx="2" fill="#111214" />
      <rect x="18.5" y="6" width="3" height="6" rx="1" fill="#a8a8a8" />
    </svg>
  );
}

export function TireWrenchIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="13" fill="#1c1c1e" />
      <circle cx="20" cy="20" r="7.5" fill="#3a3a3d" />
      <circle cx="20" cy="20" r="3" fill="#0f0f10" />
      <g fill="#0f0f10">
        <rect x="18.7" y="7" width="2.6" height="4.5" rx="1" />
        <rect x="18.7" y="28.5" width="2.6" height="4.5" rx="1" />
        <rect x="7" y="18.7" width="4.5" height="2.6" rx="1" />
        <rect x="28.5" y="18.7" width="4.5" height="2.6" rx="1" />
      </g>
      <path d="M31 6l3 3-13.5 13.5-3-3z" fill="#b6bcc3" />
      <path d="M34 9l1.6 1.6a1.6 1.6 0 01-2.3 2.3L31.7 11.3z" fill="#dfe3e7" />
    </svg>
  );
}

export function SealantGunIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <rect x="15" y="10" width="18" height="6" rx="1.5" fill="#e8663c" />
      <rect x="30" y="9" width="4" height="8" rx="1" fill="#c8511f" />
      <path d="M15 12h-3.5a2 2 0 00-2 2v3a2 2 0 002 2H15z" fill="#7a828c" />
      <rect x="9" y="16" width="3" height="12" rx="1.2" fill="#5b6169" />
      <path d="M9 27l-2.5 6.5 4.6-2.6z" fill="#3d4148" />
      <path d="M33 12c2 .6 3 1.6 3 3s-1 2.6-3 3z" fill="#f4a37c" />
    </svg>
  );
}

export function SprayCanIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <circle cx="12" cy="9" r="1.4" fill="#3aa0e8" />
      <circle cx="17" cy="6.5" r="1" fill="#ffb020" />
      <circle cx="14.5" cy="13.5" r="1" fill="#3ac26a" />
      <rect x="15.5" y="10" width="3" height="4" rx="1" fill="#8a8f97" />
      <rect x="10" y="14" width="20" height="20" rx="4" fill="#e4383f" />
      <rect x="10" y="14" width="20" height="5" rx="2.5" fill="#c4262d" />
      <rect x="13" y="21" width="14" height="9" rx="1.5" fill="#f9f9f9" />
    </svg>
  );
}

export function PlumbingWrenchIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <rect x="6" y="18.5" width="17" height="5" rx="1" fill="#9aa1aa" />
      <rect x="6" y="18.5" width="17" height="2" fill="#c7cdd4" />
      <path d="M23 14v13l7-3.5v-6z" fill="#1d5fb8" />
      <path d="M23 14v13l3.2-1.6V15.6z" fill="#2a72d6" />
      <circle cx="9" cy="21" r="3.4" fill="none" stroke="#5b6169" strokeWidth="2" />
    </svg>
  );
}

const ICONS = {
  drill: DrillIcon,
  saw: CircleAlertIcon,
  cement: CementIcon,
  hose: HoseIcon,
  paint: PaintIcon,
  wrench: WrenchIcon,
  cable: CableIcon,
  rod: RodIcon,
  fire: FireIcon,
};

export type ProductIconKey = keyof typeof ICONS;

export function ProductIcon({ icon, ...props }: { icon: ProductIconKey } & IconProps) {
  const Cmp = ICONS[icon];
  return <Cmp {...props} />;
}
