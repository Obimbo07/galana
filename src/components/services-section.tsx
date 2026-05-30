"use client";

import { ServiceCard } from "@/components/service-card";
import { useGalana } from "@/providers/galana-provider";

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
          {data.services.map((s, i) => (
            <ServiceCard key={s.num} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
