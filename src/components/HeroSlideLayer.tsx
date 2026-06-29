import type { HeroSlide } from "@/lib/data";

function gradientCss(slide: HeroSlide): string {
  const d = slide.overlay / 100;
  switch (slide.gradient) {
    case "flat":
      return `rgba(5,5,5,${0.62 * d})`;
    case "top":
      return `linear-gradient(to top, rgba(5,5,5,${0.93 * d}) 0%, rgba(5,5,5,${0.55 * d}) 55%, rgba(5,5,5,${0.15 * d}) 100%)`;
    case "bottom":
      return `linear-gradient(to bottom, rgba(5,5,5,${0.93 * d}) 0%, rgba(5,5,5,${0.55 * d}) 55%, rgba(5,5,5,${0.15 * d}) 100%)`;
    default:
      return `linear-gradient(to right, rgba(5,5,5,${0.93 * d}) 32%, rgba(5,5,5,${0.6 * d}) 70%, rgba(5,5,5,${0.38 * d}) 100%)`;
  }
}

export default function HeroSlideLayer({ slide }: { slide: HeroSlide }) {
  const gradient = gradientCss(slide);
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
        style={slide.gradient === "flat" ? { backgroundColor: gradient } : { backgroundImage: gradient }}
      />
    </>
  );
}
