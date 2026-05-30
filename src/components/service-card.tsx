"use client";

import Image from "next/image";
import { resolveServiceImageSrc, type ServiceItem } from "@/lib/service-visuals";

export function ServiceCard({
  service,
  index = 0,
  variant = "grid",
}: {
  service: ServiceItem;
  index?: number;
  variant?: "grid" | "carousel";
}) {
  const visualSrc = resolveServiceImageSrc(service);
  const isRemote = visualSrc ? /^https?:\/\//i.test(visualSrc) : false;

  return (
    <article
      className={`service-card reveal reveal-stagger-item${variant === "carousel" ? " service-card--carousel" : ""}`}
      style={{ ["--reveal-i" as string]: index }}
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
              sizes={
                variant === "carousel"
                  ? "(max-width: 900px) 82vw, 400px"
                  : "(max-width: 900px) 100vw, min(44vw, 480px)"
              }
              className="service-card-media-img"
            />
          )
        ) : null}
      </div>
      <div className="service-card-content">
        <p className="service-card-tag">{service.tag}</p>
        <h3 className="service-name">{service.name}</h3>
        <p className="service-desc">{service.desc}</p>
        <div className="service-card-accent-line" aria-hidden />
      </div>
    </article>
  );
}
