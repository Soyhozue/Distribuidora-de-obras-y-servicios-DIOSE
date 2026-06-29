import Link from "next/link";

type Promo = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
};

export default function PromoSection({ promos }: { promos: Promo[] }) {
  if (promos.length === 0) return null;

  return (
    <section className="bg-white px-6 md:px-20 py-10 border-b border-diose-border-light">
      <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-1.5">
        Ofertas
      </div>
      <div className="font-heading text-2xl text-diose-black tracking-[0.04em] mb-5">Promociones</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {promos.map((promo) => {
          const card = (
            <div className="relative aspect-[4/3] overflow-hidden bg-diose-black group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={promo.imageUrl}
                alt={promo.title ?? "Promoción"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {(promo.title || promo.subtitle) && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  {promo.title && <div className="text-white font-medium text-sm">{promo.title}</div>}
                  {promo.subtitle && <div className="text-white/70 text-xs mt-0.5">{promo.subtitle}</div>}
                </div>
              )}
            </div>
          );
          return promo.link ? (
            <Link key={promo.id} href={promo.link}>
              {card}
            </Link>
          ) : (
            <div key={promo.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
