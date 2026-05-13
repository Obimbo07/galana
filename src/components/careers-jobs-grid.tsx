"use client";

import Link from "next/link";
import { useGalana } from "@/providers/galana-provider";

export function CareersJobsGrid() {
  const { data, openApplyModal } = useGalana();

  return (
    <div className="jobs-grid careers-page-jobs-grid">
      {data.careers.jobs.map((job) => (
        <div
          key={job.slug}
          role="button"
          tabIndex={0}
            className="job-card"
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
  );
}

export function CareersPageIntro() {
  const { data } = useGalana();
  const c = data.careers;
  return (
    <header className="careers-page-intro">
      <Link href="/#careers" className="careers-back-link">
        ← Back to homepage
      </Link>
      <div className="section-tag">Galana Careers</div>
      <h1 className="section-title careers-page-title">{c.heading}</h1>
      <p className="section-sub careers-page-sub">{c.sub}</p>
    </header>
  );
}
