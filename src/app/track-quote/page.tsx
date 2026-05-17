"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackQuoteLandingPage() {
  const router = useRouter();
  const [reference, setReference] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = reference.trim();
    if (!id) return;
    router.push(`/track-quote/${encodeURIComponent(id)}`);
  };

  return (
    <div className="checkout-section-inner">
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="checkout-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span style={{ color: "var(--text)" }}>Quote status</span>
      </nav>

      <header className="checkout-intro reveal">
        <div className="section-tag">Fulfillment radar</div>
        <h1 className="checkout-heading">
          Track your <em>quote</em>
        </h1>
        <p className="checkout-lead">
          Enter the reference from your emailed quote acknowledgement to see workflow,
          payment state, scheduled logistics context, and the delivery address captured
          on your request — all synced with Galana&apos;s quoting desk.
        </p>
      </header>

      <div className="checkout-pay-grid" style={{ maxWidth: "38rem", marginTop: "-0.5rem" }}>
        <article className="checkout-panel reveal">
          <h2 className="checkout-panel-header" style={{ marginBottom: "0.75rem" }}>
            Quote reference lookup
          </h2>
          <form onSubmit={onSubmit} className="form-field">
            <label htmlFor="quote-ref" className="form-label">
              Paste reference ID
            </label>
            <input
              id="quote-ref"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Galana quote document ID"
              className="form-input"
              style={{ marginBottom: "0.85rem" }}
            />
            <button type="submit" className="btn-primary" disabled={!reference.trim()}>
              View status timeline
            </button>
          </form>
          <p className="checkout-pay-actions-hint" style={{ paddingInlineStart: "0.85rem" }}>
            After paying online, revisit this page anytime — timelines update alongside our production & delivery teams.
          </p>
        </article>

        <aside className="checkout-summary-aside-panel reveal reveal-delay-1" aria-labelledby="tq-aside-help">
          <p id="tq-aside-help" className="checkout-summary-aside-title">
            Guidance
          </p>
          <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.72, color: "var(--muted)" }}>
            <span className="checkout-track-timeline-dot" aria-hidden />
            Paid already? Confirmation appears here shortly after Paystack clears with our finance hook.
          </p>
          <p style={{ margin: "1rem 0 0", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
            Need to settle an invoice instead? Jump to checkout from your quote email link or browse products for a refreshed cart.
          </p>
          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <Link href="/products" className="checkout-muted-link">
              Browse products catalogue →
            </Link>
            <Link href="/calculator" className="checkout-muted-link">
              Open materials calculator →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
