import type { HeroSlide } from "@/lib/data";

export default function HeroSlideLayer({ slide }: { slide: HeroSlide }) {
  const darkness = slide.overlay / 100;
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${slide.url}')`,
          backgroundSize: "cover",
          backgroundPosition: `${slide.focusX}% ${slide.focusY}%`,
          transform: `scale(${slide.zoom / 100})`,
          transformOrigin: `${slide.focusX}% ${slide.focusY}%`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(5,5,5,${0.93 * darkness}) 32%, rgba(5,5,5,${0.6 * darkness}) 70%, rgba(5,5,5,${0.38 * darkness}) 100%)`,
        }}
      />
    </>
  );
}
