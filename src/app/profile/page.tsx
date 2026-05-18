"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import type { QuoteRequest } from "@/types/galana-firestore";

export default function ProfilePage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    const authUser = user;
    let cancelled = false;

    async function fetchQuotes() {
      setLoading(true);
      try {
        const token = await authUser.getIdToken();
        const res = await fetch("/api/user/quotes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setQuotes(data.quotes || []);
        }
      } catch (e) {
        console.error("Failed to fetch quotes:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchQuotes();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="checkout-section-inner">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span style={{ color: "var(--text)" }}>Profile</span>
        </nav>
        <header className="checkout-intro reveal" style={{ opacity: 1 }}>
          <h1 className="checkout-heading">
            Sign in to view your <em>profile</em>
          </h1>
          <p className="checkout-lead">
            Please sign in to access your saved quotes and track ongoing projects. Use{" "}
            <strong>Profile</strong> in the header after you sign in.
          </p>
          <Link href="/" className="btn-outline">
            Go to homepage
          </Link>
        </header>
      </div>
    );
  }

  return (
    <div className="checkout-section-inner profile-page-inner">
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="checkout-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span style={{ color: "var(--text)" }}>Quotes</span>
      </nav>

      <header className="checkout-intro reveal" style={{ opacity: 1 }}>
        <h1 className="checkout-heading">
          Your <em>quotes</em>
        </h1>
        <p className="checkout-lead" style={{ marginBottom: "1.25rem" }}>
          Signed in as <strong>{user.email}</strong>. Open any quote for status, payment, and delivery
          details.
        </p>
      </header>

      <section className="profile-quotes-section">
        <h2 className="checkout-panel-header profile-section-title">Recent submissions</h2>

        {loading ? (
          <div className="checkout-loading">
            <div className="checkout-spinner" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="checkout-alert" style={{ maxWidth: "440px" }}>
            No quotes yet. Request one from the calculator or products page while signed in so they
            appear here.
          </div>
        ) : (
          <div className="profile-quote-cards">
            {quotes.map((quote) => (
              <article key={quote.id} className="profile-quote-card">
                <div className="profile-quote-card-main">
                  <span className="profile-quote-kind">{quote.kind === "order" ? "Order" : "Quote"}</span>
                  <p className="profile-quote-ref" title={quote.id}>
                    Ref. <code>{quote.id.slice(0, 14)}…</code>
                  </p>
                  <ul className="profile-quote-meta">
                    <li>
                      <span className="checkout-summary-k">Status</span>
                      <span className="checkout-summary-v">{quote.status}</span>
                    </li>
                    <li>
                      <span className="checkout-summary-k">Total</span>
                      <span className="checkout-summary-v">
                        {quote.totalPrice != null && Number.isFinite(quote.totalPrice)
                          ? `KES ${quote.totalPrice.toLocaleString()}`
                          : "Pending"}
                      </span>
                    </li>
                    <li>
                      <span className="checkout-summary-k">Payment</span>
                      <span className="checkout-summary-v">{quote.paymentStatus || "N/A"}</span>
                    </li>
                  </ul>
                </div>
                <div className="profile-quote-card-actions">
                  <Link href={`/profile/quotes/${encodeURIComponent(quote.id)}`} className="btn-primary">
                    View details
                  </Link>
                  <Link href={`/track-quote/${encodeURIComponent(quote.id)}`} className="btn-outline">
                    Public tracking link
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
