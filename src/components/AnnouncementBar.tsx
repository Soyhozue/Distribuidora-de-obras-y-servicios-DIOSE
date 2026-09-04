export default function AnnouncementBar({ text }: { text: string }) {
  if (!text.trim()) return null;

  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="inline-flex items-center gap-3 px-6 shrink-0">
      <span className="text-diose-black">{text}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-diose-black/30" />
    </span>
  ));

  return (
    <div className="bg-diose-amber overflow-hidden whitespace-nowrap select-none">
      <div className="marquee-track flex items-center py-1.5 text-[12px] font-semibold tracking-[0.04em]">
        {items}
        {items}
      </div>
    </div>
  );
}
