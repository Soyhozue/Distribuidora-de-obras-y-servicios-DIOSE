export default function AnnouncementBar({
  text,
  bgColor,
  textColor,
  fontSize,
  speed,
  fontFamily,
}: {
  text: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  speed: number;
  fontFamily: string;
}) {
  if (!text.trim()) return null;

  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="inline-flex items-center gap-3 px-6 shrink-0">
      <span>{text}</span>
      <span className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: textColor }} />
    </span>
  ));

  return (
    <div className="overflow-hidden whitespace-nowrap select-none" style={{ background: bgColor }}>
      <div
        className="marquee-track flex items-center py-1.5 font-semibold tracking-[0.04em]"
        style={{
          color: textColor,
          fontSize: `${fontSize}px`,
          animationDuration: `${speed}s`,
          fontFamily: fontFamily === "heading" ? "var(--font-heading)" : "var(--font-sans)",
        }}
      >
        {items}
        {items}
      </div>
    </div>
  );
}
