"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGalana } from "@/providers/galana-provider";

/** Full-bleed hero backgrounds — copy/overlays stay static; only these cycle. */
const HERO_BACKGROUND_SLIDES = [
  "/wallpaper/combines.png",
  "/wallpaper/improved_images_4k_conrete-pipes.png",
  "/wallpaper/ariel-shot-galana-workmanship.png",
] as const;

const HERO_SLIDE_INTERVAL_MS = 7000;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export function Hero() {
  const { data } = useGalana();
  const reducedMotion = usePrefersReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = useMemo(
    () =>
      reducedMotion
        ? [HERO_BACKGROUND_SLIDES[0]]
        : [...HERO_BACKGROUND_SLIDES],
    [reducedMotion]
  );

  /** Defer mounting non-first slides until after first paint so the LCP image isn't
   *  starved by 2 additional 2 MB PNGs decoded in parallel. */
  const [mountedSlides, setMountedSlides] = useState(1);
  useEffect(() => {
    if (slides.length <= 1) return;
    const idle =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 800));
    idle(() => setMountedSlides(slides.length));
  }, [slides.length]);

  const h = data.hero;

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, HERO_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, slides.length]);

  useEffect(() => {
    if (slideIndex >= slides.length) setSlideIndex(0);
  }, [slides.length, slideIndex]);

  return (
    <section id="hero">
      <div className="hero-photo" aria-hidden="true">
        <div className="hero-photo-carousel">
          {slides.slice(0, mountedSlides).map((src, i) => (
            <div
              key={src}
              className={`hero-photo-slide${i === slideIndex ? " hero-photo-slide-active" : ""}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                quality={i === 0 ? 80 : 75}
                priority={i === 0}
                fetchPriority={i === slideIndex ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
                className="hero-photo-img"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="hero-bg" aria-hidden />
      <div className="hero-shell">
        <div className="hero-main">
          <div className="hero-copy">
            <div className="hero-eyebrow">{h.eyebrow}</div>
            <h1 className="hero-title">
              {h.titleLines.map((line, i) => (
                <span key={i}>
                  {i === h.titleItalicIndex ? (
                    <em className="hero-title-accent">{line}</em>
                  ) : (
                    line
                  )}
                  {i < h.titleLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h1>
            <p className="hero-sub">{h.sub}</p>
            <div className="hero-actions">
              <Link href={h.primaryCta.href} className="btn-primary">
                <span>{h.primaryCta.label}</span>
                <span>→</span>
              </Link>
              <Link href={h.secondaryCta.href} className="btn-outline">
                <span>{h.secondaryCta.label}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* <div className="hero-bottom">
          <div className="hero-stats">
            {h.stats.map((s, i) => (
              <div className="stat" key={i}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div id="diff-band">
            <div className="diff-scroll" id="diffScroll">
              {[...h.diffBand, ...h.diffBand].map((text, i) => (
                <span className="diff-item" key={i}>
                  <span className="diff-dot" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
