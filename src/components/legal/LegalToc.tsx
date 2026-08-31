type TocItem = { id: string; label: string };

export default function LegalToc({ items }: { items: TocItem[] }) {
  return (
    <nav className="border border-diose-border-light bg-diose-gray/60 px-5 py-4 mb-2" aria-label="Contenido">
      <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 block mb-3">
        Contenido
      </span>
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {items.map((item, i) => (
          <li key={item.id} className="text-[13px] text-gray-600">
            <a href={`#${item.id}`} className="hover:text-diose-black underline decoration-gray-300 underline-offset-2">
              {i + 1}. {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
