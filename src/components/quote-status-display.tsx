"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { QuoteTrackResponse } from "@/types/quote-tracking";

export function workflowLabel(status: string): string {
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

export type QuoteStatusCrumb = { href?: string; label: string };

export function QuoteStatusBreadcrumbs({ crumbs }: { crumbs: QuoteStatusCrumb[] }) {
  return (
    <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
      {crumbs.flatMap((c, i) => {
        const nodes: ReactNode[] = [];
        if (i > 0) {
          nodes.push(
            <span key={`sep-${i}`} className="checkout-breadcrumb-sep" aria-hidden>
              /
            </span>
          );
        }
        nodes.push(
          c.href ? (
            <Link key={`crumb-${i}`} href={c.href}>
              {c.label}
            </Link>
          ) : (
            <span key={`crumb-${i}`} style={{ color: "var(--text)" }}>
              {c.label}
            </span>
          )
        );
        return nodes;
      })}
    </nav>
  );
}

export function QuoteStatusDetail({ detail }: { detail: QuoteTrackResponse }) {
  return (
    <>
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

      <div
        className="checkout-pay-grid"
        style={{ maxWidth: "960px", marginInline: "auto", width: "100%" }}
      >
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

          <div
            className="checkout-steps-line"
            style={{ marginTop: "1.5rem", marginBottom: "0.9rem" }}
          >
            <span>Delivery intel</span>
            <span className="checkout-steps-line-bar" aria-hidden />
          </div>
          {detail.deliveryLocation ? (
            <p
              style={{
                margin: "0",
                paddingInlineStart: "0.85rem",
                color: "var(--muted)",
                lineHeight: 1.72,
                fontSize: "0.96rem",
                maxWidth: "48ch",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "var(--blue)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                }}
              >
                Site logistics
              </strong>
              {detail.deliveryLocation}
            </p>
          ) : (
            <p
              style={{
                margin: "0",
                paddingInlineStart: "0.85rem",
                fontSize: "0.94rem",
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              Logistics address hasn&apos;t been captured on-file — ping our dispatch desk if
              milestones need revising once production slots open.
            </p>
          )}

          <div
            className="checkout-steps-line"
            style={{ marginTop: "2rem", marginBottom: "0.9rem" }}
          >
            <span>Timestamps</span>
            <span className="checkout-steps-line-bar" aria-hidden />
          </div>
          <ul
            style={{
              paddingInlineStart: "0.85rem",
              margin: 0,
              listStyle: "none",
              display: "grid",
              gap: "0.85rem",
              fontSize: "0.9rem",
              color: "var(--muted)",
            }}
          >
            <li>
              <span
                className="checkout-summary-k"
                style={{ display: "block", marginBottom: "0.2rem" }}
              >
                Captured
              </span>
              {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}
            </li>
            <li>
              <span
                className="checkout-summary-k"
                style={{ display: "block", marginBottom: "0.2rem" }}
              >
                Latest refresh
              </span>
              {detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : "—"}
            </li>
          </ul>
        </article>

        <aside className="checkout-summary-aside-panel" aria-labelledby="track-aside-actions">
          <p id="track-aside-actions" className="checkout-summary-aside-title">
            Actions
          </p>
          {detail.paymentStatus !== "paid" && typeof detail.totalPrice === "number" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>
                Settlement through Paystack finalises tooling & pour scheduling commitments for this
                quotation.
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>
                Ledger shows this milestone as fulfilled — standby for fabrication and dispatch
                updates from Galana coordinators.
              </p>
              <span className="checkout-quote-id-pill" aria-live="polite">
                Settlement complete
              </span>
            </div>
          )}
          <div
            style={{
              marginTop: "1.25rem",
              borderTop: "1px dashed color-mix(in srgb, var(--border), transparent 45%)",
              paddingTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              fontSize: "0.85rem",
              color: "var(--muted)",
            }}
          >
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
    </>
  );
}
