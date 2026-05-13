"use client";

import Image from "next/image";
import { useGalana } from "@/providers/galana-provider";

/** Fallback visuals when `services[].image` is omitted (files live under `public/images/wallpapers/`). */
const serviceAccentSrc: Record<string, string> = {
  "01": "/images/wallpapers/concrete-pipes.png",
  "02": "/images/wallpapers/custom-designs.png",
  "03": "/images/wallpapers/site-assesment.jpeg",
  "04": "/images/wallpapers/tracked-delievery.jpeg",
  "05": "/images/wallpapers/contractor.jpeg",
  "06": "/images/wallpapers/connector-network.jpeg",
};

const neutralServicePlaceholder = "/images/wallpapers/custom-designs.png";

function normalizePublicImageSrc(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return t.startsWith("/") ? t : `/${t}`;
}

export function ServicesSection() {
  const { data } = useGalana();
  return (
    <section id="services">
      <div className="section-inner">
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
          {data.services.map((s, i) => {
            const visualSrc =
              normalizePublicImageSrc(s.image) ??
              normalizePublicImageSrc(serviceAccentSrc[s.num]) ??
              normalizePublicImageSrc(neutralServicePlaceholder);
            const isRemote = visualSrc
              ? /^https?:\/\//i.test(visualSrc)
              : false;
            return (
              <div
                className={`service-card reveal reveal-stagger-item`}
                key={s.num}
                style={{ ["--reveal-i" as string]: i }}
              >
                <div
                  className={`service-card-media${!visualSrc ? " service-card-media--placeholder" : ""}`}
                >
                  {visualSrc ? (
                    isRemote ? (
                      // eslint-disable-next-line @next/next/no-img-element -- optional remote URLs without remotePatterns
                      <img
                        src={visualSrc}
                        alt=""
                        className="service-card-media-img"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    ) : (
                      <Image
                        src={visualSrc}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 100vw, min(44vw, 480px)"
                        className="service-card-media-img"
                      />
                    )
                  ) : null}
                </div>
                <div className="service-card-content">
                  <h3 className="service-name">{s.name}</h3>
                  <p className="service-desc">{s.desc}</p>
                  <div className="service-card-accent-line" aria-hidden />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
