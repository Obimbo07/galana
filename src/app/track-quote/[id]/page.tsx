"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type TrackResponse = {
  id: string;
  kind: string;
  status: string;
  paymentStatus: string;
  paymentLabel: string;
  totalPrice: number | null;
  deliveryLocation: string | null;
  createdAt: string;
  updatedAt: string;
  summary: string;
};

function workflowLabel(status: string): string {
  switch (status) {
    case "processing":
      return "Under review";
    case "quoted":
      return "Quoted";
    case "confirmed":
      return "Confirmed / fulfilment";
    case "declined":
      return "Closed";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

function routeSegmentParam(param: unknown): string | null {
  if (typeof param === "string" && param.trim()) {
    try {
      return decodeURIComponent(param.trim());
    } catch {
      return param.trim();
    }
  }
  if (Array.isArray(param) && typeof param[0] === "string" && param[0].trim()) {
    try {
      return decodeURIComponent(param[0].trim());
    } catch {
      return param[0].trim();
    }
  }
  return null;
}

export default function TrackQuoteDetailPage() {
  const routeParams = useParams();
  const quoteId = routeSegmentParam(routeParams.id) ?? null;

  const [detail, setDetail] = useState<TrackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!quoteId?.trim()) {
        setDetail(null);
        setError(
          "Add a quote reference to the URL, or paste your ID on the tracking page."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/track/quote/${encodeURIComponent(quoteId)}`);
        const raw = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          throw new Error(
            typeof raw.error === "string" ? raw.error : "Could not load this quote."
          );
        }
        if (!cancelled) setDetail(raw as TrackResponse);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  if (loading) {
    return (
      <div className="checkout-section-inner checkout-loading">
        <div className="checkout-spinner" aria-hidden />
        <p className="section-tag" style={{ justifyContent: "center", marginBottom: "0.5rem" }}>
          Quote status
        </p>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Connecting to fulfilment telemetry…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-section-inner">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <Link href="/track-quote">Quote status</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span style={{ color: "var(--text)" }}>Error</span>
        </nav>
        <div className="checkout-result-center">
          <div className="checkout-alert">{error}</div>
          <div className="checkout-result-actions">
            <Link href="/track-quote" className="btn-outline">
              Try another reference
            </Link>
            <Link href="/" className="btn-primary">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="checkout-section-inner">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <Link href="/track-quote">Quote status</Link>
        </nav>
        <div className="checkout-result-center">
          <div className="checkout-alert">
            We couldn&apos;t load details for this reference. Reload the page or verify the ID matches your email.
          </div>
          <div className="checkout-result-actions">
            <Link href="/track-quote" className="btn-primary">
              Back to tracking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-section-inner">
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="checkout-breadcrumb-sep" aria-hidden>
          /
        </span>
        <Link href="/track-quote">Quote status</Link>
        <span className="checkout-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span style={{ color: "var(--text)" }}>{detail.id}</span>
      </nav>

      <header className="checkout-intro">
        <div className="section-tag">Live roadmap</div>
        <h1 className="checkout-heading">
          Logistics & fulfilment <em>roadmap</em>
        </h1>
        <div style={{ marginBottom: "1rem", paddingInlineStart: "0.1rem" }}>
          <span className="checkout-quote-id-pill" title={detail.id}>
            Reference #{detail.id}
          </span>
        </div>
        <p className="checkout-lead">{detail.summary}</p>
      </header>

      <div className="checkout-pay-grid" style={{ maxWidth: "960px", marginInline: "auto", width: "100%" }}>
        <article className="checkout-panel">
          <h2 className="checkout-panel-header">Operational checkpoints</h2>
          <div className="checkout-summary-rows">
            <div className="checkout-summary-row">
              <span className="checkout-summary-k">
                <span className="checkout-track-timeline-dot" aria-hidden />
                Commercial status
              </span>
              <span className="checkout-summary-v">{workflowLabel(detail.status)}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-k">Finance status</span>
              <span className="checkout-summary-v">{detail.paymentLabel}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-k">Recorded total</span>
              <span className="checkout-amount-strong" style={{ fontSize: "1.45rem" }}>
                {detail.totalPrice != null && Number.isFinite(detail.totalPrice)
                  ? `KES ${detail.totalPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "Pending admin"}
              </span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-k">Engagement type</span>
              <span className="checkout-summary-v">
                {detail.kind === "order" ? "Order cluster" : "Quote submission"}
              </span>
            </div>
          </div>

          <div className="checkout-steps-line" style={{ marginTop: "1.5rem", marginBottom: "0.9rem" }}>
            <span>Delivery intel</span>
            <span className="checkout-steps-line-bar" aria-hidden />
          </div>
          {detail.deliveryLocation ? (
            <p style={{ margin: "0", paddingInlineStart: "0.85rem", color: "var(--muted)", lineHeight: 1.72, fontSize: "0.96rem", maxWidth: "48ch" }}>
              <strong style={{ display: "block", color: "var(--blue)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.45rem" }}>
                Site logistics
              </strong>
              {detail.deliveryLocation}
            </p>
          ) : (
            <p style={{ margin: "0", paddingInlineStart: "0.85rem", fontSize: "0.94rem", color: "var(--muted)", lineHeight: 1.7 }}>
              Logistics address hasn&apos;t been captured on-file — ping our dispatch desk if milestones need revising once production slots open.
            </p>
          )}

          <div className="checkout-steps-line" style={{ marginTop: "2rem", marginBottom: "0.9rem" }}>
            <span>Timestamps</span>
            <span className="checkout-steps-line-bar" aria-hidden />
          </div>
          <ul style={{ paddingInlineStart: "0.85rem", margin: 0, listStyle: "none", display: "grid", gap: "0.85rem", fontSize: "0.9rem", color: "var(--muted)" }}>
            <li>
              <span className="checkout-summary-k" style={{ display: "block", marginBottom: "0.2rem" }}>Captured</span>
              {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}
            </li>
            <li>
              <span className="checkout-summary-k" style={{ display: "block", marginBottom: "0.2rem" }}>Latest refresh</span>
              {detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : "—"}
            </li>
          </ul>
        </article>

        <aside className="checkout-summary-aside-panel" aria-labelledby="track-aside-actions">
          <p id="track-aside-actions" className="checkout-summary-aside-title">
            Actions
          </p>
          {detail.paymentStatus !== "paid" && typeof detail.totalPrice === "number" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>
                Settlement through Paystack finalises tooling & pour scheduling commitments for this quotation.
              </p>
              <Link
                href={`/pay/${encodeURIComponent(detail.id)}`}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                Pay now securely
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>
                Ledger shows this milestone as fulfilled — standby for fabrication and dispatch updates from Galana coordinators.
              </p>
              <span className="checkout-quote-id-pill" aria-live="polite">
                Settlement complete
              </span>
            </div>
          )}
          <div style={{ marginTop: "1.25rem", borderTop: "1px dashed color-mix(in srgb, var(--border), transparent 45%)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "var(--muted)" }}>
            <span className="checkout-summary-k" style={{ display: "block" }}>
              Need escalation?
            </span>
            <Link href="/#contact" className="checkout-muted-link">
              Contact concierge →
            </Link>
            <Link href="/products" className="checkout-muted-link">
              Catalogue refresh →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
