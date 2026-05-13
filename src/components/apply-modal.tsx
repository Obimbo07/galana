"use client";

import { useEffect } from "react";
import { useGalana } from "@/providers/galana-provider";

export function ApplyModal() {
  const { applyModalTitle, closeApplyModal } = useGalana();

  useEffect(() => {
    if (!applyModalTitle) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [applyModalTitle]);

  if (!applyModalTitle) return null;

  return (
    <div
      className="modal-overlay open"
      id="applyModal"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeApplyModal();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={closeApplyModal}
        >
          ✕
        </button>
        <div className="modal-title" id="modalJobTitle">
          {applyModalTitle}
        </div>
        <div className="modal-sub">
          Fill in your details and we&apos;ll be in touch shortly.
        </div>
        <div className="form-field">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Your full name"
          />
        </div>
        <div className="form-field">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="your@email.com"
          />
        </div>
        <div className="form-field">
          <label className="form-label">Phone</label>
          <input type="tel" className="form-input" placeholder="+254..." />
        </div>
        <div className="form-field">
          <label className="form-label">
            LinkedIn / Portfolio URL (optional)
          </label>
          <input type="url" className="form-input" placeholder="https://..." />
        </div>
        <div className="form-field">
          <label className="form-label">Why Galana Group?</label>
          <textarea
            className="form-textarea"
            placeholder="Tell us why you would be a great fit..."
          />
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => {
            closeApplyModal();
            window.alert(
              "Thank you for applying! We will review your application and be in touch within 5 business days."
            );
          }}
        >
          Submit Application →
        </button>
      </div>
    </div>
  );
}
