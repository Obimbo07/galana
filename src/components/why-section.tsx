"use client";

import { useGalana } from "@/providers/galana-provider";

export function WhySection() {
  const { data } = useGalana();
  const w = data.why;
  return (
    <section id="why">
      <div className="why-mood-strip" aria-hidden />
      <div className="why-wrapper">
        <div>
          <div className="section-tag reveal">{w.sectionTag}</div>
          <h2 className="section-title reveal reveal-delay-1">
            The Galana <em>Difference</em>
          </h2>
          <ul className="why-list">
            {w.items.map((item, i) => (
              <div
                className={`why-item reveal reveal-delay-${Math.min(i + 1, 4)}`}
                key={item.title}
              >
                <div className="why-icon">{item.icon}</div>
                <div className="why-item-content">
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </ul>
        </div>
        <div className="why-visual reveal reveal-delay-2">
          <div className="why-hex-grid">
            {w.hexMetrics.map((h) => (
              <div className="why-hex" key={h.label}>
                <div className="why-hex-num">{h.num}</div>
                <div className="why-hex-label">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
