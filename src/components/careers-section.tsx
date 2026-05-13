"use client";

import Link from "next/link";
import { useGalana } from "@/providers/galana-provider";

export function CareersSection() {
  const { data, openApplyModal } = useGalana();
  const c = data.careers;
  const featured = c.jobs.find((j) => j.slug === c.featuredJobSlug);

  return (
    <section id="careers">
      <div className="section-inner">
        <div className="careers-header">
          <div>
            <div className="section-tag reveal">Join the Team</div>
            <h2 className="section-title reveal reveal-delay-1">
              Build Your <em>Career</em> With Us
            </h2>
            <p
              className="section-sub reveal reveal-delay-2"
              style={{ marginBottom: 0 }}
            >
              {c.sub}
            </p>
          </div>
          <button
            type="button"
            className="btn-outline reveal reveal-delay-3"
            onClick={() => openApplyModal("general")}
          >
            {c.openApplicationCta}
          </button>
        </div>

        {featured ? (
          <article className="careers-featured-card reveal reveal-delay-4">
            <div className="careers-featured-kicker">Featured opening</div>
            <h3 className="careers-featured-title">{featured.title}</h3>
            <div className="job-meta careers-featured-meta">
              {featured.tags.map((t) => (
                <div className="job-tag" key={t}>
                  <span className="job-tag-dot" />
                  {t}
                </div>
              ))}
            </div>
            {c.featuredSummary ? (
              <p className="careers-featured-summary">{c.featuredSummary}</p>
            ) : null}
            <div className="careers-featured-actions">
              <Link href="/careers" className="btn-outline">
                {c.viewAllRolesCta}
              </Link>
              <button
                type="button"
                className="btn-primary"
                onClick={() => openApplyModal(featured.modalKey)}
              >
                Apply for this role
              </button>
            </div>
          </article>
        ) : (
          <p className="section-sub">
            No featured role configured — visit{" "}
            <Link href="/careers">Careers</Link> for openings.
          </p>
        )}
      </div>
    </section>
  );
}
