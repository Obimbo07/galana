"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { ServiceCard } from "@/components/service-card";
import { useGalana } from "@/providers/galana-provider";

export function ServicesCarousel() {
  const { data } = useGalana();
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollBySlide = useCallback((direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const track = viewport.querySelector<HTMLElement>(".services-carousel-track");
    const slide = viewport.querySelector<HTMLElement>(".services-carousel-slide");
    const gap = track
      ? parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 22
      : 22;
    const amount = slide
      ? slide.offsetWidth + gap
      : Math.round(viewport.clientWidth * 0.85);
    viewport.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, []);

  return (
    <section id="services-carousel" className="services-carousel">
      <div className="section-inner">
        <div className="services-carousel-head">
          <div>
            <div className="section-tag reveal">What We Do</div>
            <h2 className="section-title reveal reveal-delay-1">
              Services That Go <em>Beyond Supply</em>
            </h2>
            <p className="section-sub reveal reveal-delay-2 services-carousel-sub">
              We don&apos;t just sell concrete — we partner from design to
              installation, ensuring your project succeeds from groundbreak to
              handover.
            </p>
          </div>
          <Link
            href="/services"
            className="btn-outline services-carousel-all reveal reveal-delay-2"
          >
            Explore all services →
          </Link>
        </div>

        <div className="services-carousel-wrap products-carousel-wrap">
          <button
            type="button"
            className="products-carousel-arrow products-carousel-arrow-prev"
            aria-label="Previous service"
            onClick={() => scrollBySlide(-1)}
          >
            ‹
          </button>
          <div
            ref={viewportRef}
            className="products-carousel-viewport services-carousel-viewport"
            role="region"
            aria-label="Galana services carousel"
            tabIndex={0}
          >
            <div className="products-carousel-track services-carousel-track">
              {data.services.map((service, i) => (
                <div
                  key={service.num}
                  className="products-carousel-slide services-carousel-slide"
                >
                  <ServiceCard service={service} index={i} variant="carousel" />
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="products-carousel-arrow products-carousel-arrow-next"
            aria-label="Next service"
            onClick={() => scrollBySlide(1)}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
