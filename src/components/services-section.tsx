"use client";

import Image from "next/image";
import { useGalana } from "@/providers/galana-provider";

const serviceAccentSrc: Record<string, string> = {
  "01": "/wallpaper/concrete-pipes.png",
  "06": "/wallpaper/pavement-lay.png",
};

export function ServicesSection() {
  const { data } = useGalana();
  return (
    <section id="services">
      <div className="section-tag reveal">What We Do</div>
      <h2 className="section-title reveal reveal-delay-1">
        Services That Go <em>Beyond Supply</em>
      </h2>
      <p className="section-sub reveal reveal-delay-2">
        We don&apos;t just sell concrete — we partner from design to
        installation, ensuring your project succeeds from groundbreak to
        handover.
      </p>
      <div className="services-grid">
        {data.services.map((s, i) => (
          <div
            className="service-card reveal reveal-stagger-item"
            key={s.num}
            style={{ ["--reveal-i" as string]: i }}
          >
            {serviceAccentSrc[s.num] ? (
              <div className="service-card-accent" aria-hidden>
                <Image
                  src={serviceAccentSrc[s.num]}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 420px"
                  className="service-card-accent-img"
                />
              </div>
            ) : null}
            <div className="service-num">{s.num}</div>
            <div className="service-icon">{s.icon}</div>
            <div className="service-name">{s.name}</div>
            <div className="service-desc">{s.desc}</div>
            <div className="service-tag">{s.tag}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
