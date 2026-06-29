"use client";

import { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/images/hero-warehouse.png";

export default function HeroCarousel({ images }: { images: string[] }) {
  const slides = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="absolute inset-0">
      {slides.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === active ? 1 : 0,
            backgroundImage: `linear-gradient(to right, rgba(5,5,5,.93) 32%, rgba(5,5,5,.6) 70%, rgba(5,5,5,.38) 100%), url('${src}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 42%",
          }}
        />
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-6 md:left-20 z-10 flex gap-1.5">
          {slides.map((_, i) => (
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
