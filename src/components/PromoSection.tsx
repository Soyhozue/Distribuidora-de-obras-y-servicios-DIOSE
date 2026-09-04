import Link from "next/link";
import RevealOnScroll from "./RevealOnScroll";

type Promo = {
  id: string;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  title: string | null;
  subtitle: string | null;
  badgeText: string | null;
  sectionLabel: string | null;
  link: string | null;
};

function PromoCard({ promo }: { promo: Promo }) {
  const card = (
    <div className="relative aspect-[4/3] overflow-hidden bg-diose-black group">
      {promo.mediaType === "VIDEO" ? (
        <video
          src={promo.imageUrl}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={promo.imageUrl}
          alt={promo.title ?? "Promoción"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {promo.badgeText && (
        <div className="absolute top-3 right-3 bg-diose-amber text-white text-[11px] font-bold tracking-[0.02em] px-3 py-1.5 rotate-3 shadow-strong">
          {promo.badgeText}
        </div>
      )}

      {(promo.title || promo.subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 to-transparent">
          {promo.title && <div className="text-white font-medium text-sm">{promo.title}</div>}
          {promo.subtitle && <div className="text-white/70 text-xs mt-0.5">{promo.subtitle}</div>}
        </div>
      )}
    </div>
  );
  return promo.link ? (
    <Link href={promo.link} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      className="relative overflow-hidden mb-5 py-2.5 px-5 flex items-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--color-diose-black) 0 14px, var(--color-diose-amber) 14px 28px)",
      }}
    >
      <span className="bg-diose-black text-white text-[13px] md:text-[15px] font-bold tracking-[0.06em] uppercase px-4 py-1.5">
        {label}
      </span>
    </div>
  );
}

export default function PromoSection({ promos }: { promos: Promo[] }) {
  if (promos.length === 0) return null;

  const grouped: { label: string | null; items: Promo[] }[] = [];
  for (const promo of promos) {
    const last = grouped[grouped.length - 1];
    if (last && last.label === promo.sectionLabel) {
      last.items.push(promo);
    } else {
      grouped.push({ label: promo.sectionLabel, items: [promo] });
    }
  }

  return (
    <section className="bg-white px-6 md:px-20 py-10 border-b border-diose-border-light flex flex-col gap-12">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
        {grouped.map((group, gi) => (
          <RevealOnScroll key={gi}>
            {group.label ? (
              <SectionHeader label={group.label} />
            ) : (
              <>
                <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-1.5">
                  Ofertas
                </div>
                <div className="font-heading text-2xl text-diose-black tracking-[0.04em] mb-5">Promociones</div>
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {group.items.map((promo) => (
                <PromoCard key={promo.id} promo={promo} />
              ))}
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
