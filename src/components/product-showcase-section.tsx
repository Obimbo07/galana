"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const SHOWCASE_SRC = "/wallpaper/galana-3D-product-category-images.png";
const SHOWCASE_WIDTH = 1408;
const SHOWCASE_HEIGHT = 768;
const SHOWCASE_ALT =
  "Galana product categories — drainage and pipes, precast concrete, paving, roof tiles, vents, and laundry sinks";

function ProductShowcaseLightbox({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    queueMicrotask(() => closeBtnRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="showcase-lightbox-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="showcase-lightbox-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Product categories — full size"
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="showcase-lightbox-close product-quick-close"
          aria-label="Close full size view"
          onClick={onClose}
        >
          ✕
        </button>
        <p className="showcase-lightbox-hint">Pinch or scroll to inspect details</p>
        <div className="showcase-lightbox-scroll">
          {/* eslint-disable-next-line @next/next/no-img-element -- full-res popup */}
          <img
            src={SHOWCASE_SRC}
            alt={SHOWCASE_ALT}
            width={SHOWCASE_WIDTH}
            height={SHOWCASE_HEIGHT}
            className="showcase-lightbox-img"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export function ProductShowcaseSection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  return (
    <section
      id="product-showcase"
      className="product-showcase"
      aria-label="Galana product categories"
    >
      <div className="product-showcase-inner">
        <button
          type="button"
          className="product-showcase-trigger reveal"
          onClick={openLightbox}
          aria-label="View product categories full size"
        >
          <span className="product-showcase-media">
            <Image
              src={SHOWCASE_SRC}
              alt={SHOWCASE_ALT}
              fill
              sizes="(max-width: 900px) 100vw, (max-width: 1400px) 1280px, 1408px"
              quality={90}
              loading="lazy"
              className="product-showcase-img"
            />
          </span>
          <span className="product-showcase-expand" aria-hidden="true">
            <span className="product-showcase-expand-icon">⤢</span>
            View full size
          </span>
        </button>
        <p className="product-showcase-hint">Tap the image for a larger view</p>
      </div>

      <ProductShowcaseLightbox open={lightboxOpen} onClose={closeLightbox} />
    </section>
  );
}
