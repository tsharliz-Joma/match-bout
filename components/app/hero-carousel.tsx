"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type HeroSlide = {
  title: string;
  detail: string;
  summary: string;
  image: string;
  badge?: string;
};

export function HeroCarousel({ slides, intervalMs = 5200 }: { slides: HeroSlide[]; intervalMs?: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [paused, slides.length, intervalMs]);

  return (
    <div className="space-y-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-steel/70 shadow-soft">
        <div className="relative h-[420px]">
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
              aria-hidden={index !== activeIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                {slide.badge ? <Badge variant="premium">{slide.badge}</Badge> : null}
                <h3 className="mt-3 text-2xl font-semibold">{slide.title}</h3>
                <p className="mt-2 text-sm text-white/80">{slide.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-2 backdrop-blur">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${index === activeIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {slides.map((slide, index) => (
          <div
            key={`${slide.title}-summary`}
            className={`rounded-xl border border-white/10 bg-charcoal p-3 transition ${
              index === activeIndex ? "border-ember/60 bg-charcoal/80" : ""
            }`}
          >
            <p className="text-sm font-semibold">{slide.title}</p>
            <p className="mt-1 text-xs text-muted">{slide.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
