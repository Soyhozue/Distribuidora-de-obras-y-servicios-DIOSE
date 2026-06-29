"use client";

import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/data";

const FALLBACK_SLIDE: HeroSlide = {
  url: "/images/hero-warehouse.png",
  focusX: 50,
  focusY: 42,
  zoom: 100,
  overlay: 100,
};

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const items = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {items.map((slide, i) => {
        const darkness = slide.overlay / 100;
        return (
          <div key={slide.url + i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === active ? 1 : 0 }}>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${slide.url}')`,
                backgroundSize: "cover",
                backgroundPosition: `${slide.focusX}% ${slide.focusY}%`,
                transform: `scale(${slide.zoom / 100})`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(5,5,5,${0.93 * darkness}) 32%, rgba(5,5,5,${0.6 * darkness}) 70%, rgba(5,5,5,${0.38 * darkness}) 100%)`,
              }}
            />
          </div>
        );
      })}
      {items.length > 1 && (
        <div className="absolute bottom-5 left-6 md:left-20 z-10 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1 transition-all cursor-pointer ${i === active ? "w-6 bg-diose-amber" : "w-3 bg-white/30"}`}
              aria-label={`Ver imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
