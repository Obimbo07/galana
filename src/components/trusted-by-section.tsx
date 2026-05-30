"use client";

import { TRUSTED_PARTNERS } from "@/lib/trusted-partners";

const MARQUEE_PARTNERS = [...TRUSTED_PARTNERS, ...TRUSTED_PARTNERS];

export function TrustedBySection() {
  return (
    <section
      id="trusted-by"
      className="trusted-by"
      aria-labelledby="trusted-by-heading"
    >
      <div className="section-inner trusted-by-inner">
        <p className="trusted-by-eyebrow reveal">Partners &amp; compliance</p>
        <h2 id="trusted-by-heading" className="trusted-by-title reveal reveal-delay-1">
          Trusted by teams building <em>Kenya</em>
        </h2>
        <p className="trusted-by-sub reveal reveal-delay-2">
          Standards bodies, roads authorities, counties, and infrastructure
          partners we work alongside on projects nationwide.
        </p>
      </div>

      <div className="trusted-by-marquee" aria-hidden="false">
        <ul className="trusted-by-track" aria-label="Partner organisations">
          {MARQUEE_PARTNERS.map((partner, i) => (
            <li
              className="trusted-by-logo"
              key={`${partner.id}-${i}`}
              title={partner.name}
            >
              {partner.href ? (
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trusted-by-logo-link"
                  aria-label={`${partner.name} (opens in new tab)`}
                  tabIndex={i < TRUSTED_PARTNERS.length ? 0 : -1}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local SVG wordmarks */}
                  <img
                    src={partner.logo}
                    alt=""
                    width={220}
                    height={56}
                    className="trusted-by-logo-img"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- local SVG wordmarks
                <img
                  src={partner.logo}
                  alt={partner.name}
                  width={220}
                  height={56}
                  className="trusted-by-logo-img"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
