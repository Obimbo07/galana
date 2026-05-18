"use client";

import Image from "next/image";
import Link from "next/link";
import { useGalana } from "@/providers/galana-provider";

export function Hero() {
  const { data } = useGalana();

  const h = data.hero;

  return (
    <section id="hero">
      <div className="hero-photo">
        <Image
          src="/wallpaper/combines.png"
          alt="Galana concrete pipes, paving, roof tiles and precast products"
          fill
          priority
          sizes="100vw"
          quality={92}
          className="hero-photo-img"
        />
      </div>
      <div className="hero-bg" aria-hidden />
      <div className="hero-grid" aria-hidden />
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

        <div className="scroll-indicator">
          <div className="scroll-line" />
          <span>Scroll to explore</span>
        </div>

        <div className="hero-bottom">
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
        </div>
      </div>
    </section>
  );
}
