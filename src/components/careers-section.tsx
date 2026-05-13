"use client";

import { useGalana } from "@/providers/galana-provider";

export function CareersSection() {
  const { data, openApplyModal } = useGalana();
  const c = data.careers;

  return (
    <section id="careers">
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

      <div className="jobs-grid">
        {c.jobs.map((job, i) => (
          <div
            key={job.title}
            role="button"
            tabIndex={0}
            className="job-card reveal reveal-stagger-item"
            style={{ ["--reveal-i" as string]: i }}
            onClick={() => openApplyModal(job.modalKey)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openApplyModal(job.modalKey);
              }
            }}
          >
            <div className="job-left">
              <div className="job-title">{job.title}</div>
              <div className="job-meta">
                {job.tags.map((t) => (
                  <div className="job-tag" key={t}>
                    <span className="job-tag-dot" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="job-apply">Apply Now →</div>
          </div>
        ))}
      </div>
    </section>
  );
}
