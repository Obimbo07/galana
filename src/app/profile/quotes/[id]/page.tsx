"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  QuoteStatusBreadcrumbs,
  QuoteStatusDetail,
} from "@/components/quote-status-display";
import { useAuth } from "@/providers/auth-provider";
import type { QuoteTrackResponse } from "@/types/quote-tracking";

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

export default function ProfileQuoteDetailPage() {
  const routeParams = useParams();
  const quoteId = routeSegmentParam(routeParams.id) ?? null;
  const { user, loading: authLoading } = useAuth();

  const [detail, setDetail] = useState<QuoteTrackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function run() {
      if (!user) {
        setDetail(null);
        setError(null);
        setLoading(false);
        return;
      }

      if (!quoteId?.trim()) {
        setDetail(null);
        setError("Missing quote reference.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/user/quotes/${encodeURIComponent(quoteId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          throw new Error(
            typeof raw.error === "string" ? raw.error : "Could not load this quote."
          );
        }
        if (!cancelled) setDetail(raw as QuoteTrackResponse);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [quoteId, user, authLoading]);

  if (!authLoading && !user) {
    return (
      <div className="checkout-section-inner">
        <QuoteStatusBreadcrumbs
          crumbs={[
            { href: "/", label: "Home" },
            { href: "/profile", label: "Profile" },
            { label: "Quote" },
          ]}
        />
        <div className="checkout-result-center">
          <div className="checkout-alert">Sign in to view quotes linked to your account.</div>
          <Link href="/profile" className="btn-primary">
            Back to profile
          </Link>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="checkout-section-inner checkout-loading">
        <div className="checkout-spinner" aria-hidden />
        <p className="section-tag" style={{ justifyContent: "center", marginBottom: "0.5rem" }}>
          Quote status
        </p>
        <p style={{ margin: 0, color: "var(--muted)" }}>Loading your quote…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-section-inner">
        <QuoteStatusBreadcrumbs
          crumbs={[
            { href: "/", label: "Home" },
            { href: "/profile", label: "Profile" },
            { label: "Error" },
          ]}
        />
        <div className="checkout-result-center">
          <div className="checkout-alert">{error}</div>
          <div className="checkout-result-actions">
            <Link href="/profile" className="btn-outline">
              Back to quotes
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
        <QuoteStatusBreadcrumbs
          crumbs={[
            { href: "/", label: "Home" },
            { href: "/profile", label: "Profile" },
            { label: "Quote" },
          ]}
        />
        <div className="checkout-result-center">
          <div className="checkout-alert">We couldn&apos;t load this quote.</div>
          <Link href="/profile" className="btn-primary">
            Back to quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-section-inner profile-page-inner">
      <QuoteStatusBreadcrumbs
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/profile", label: "Profile" },
          { label: detail.id.slice(0, 12) + "…" },
        ]}
      />
      <QuoteStatusDetail detail={detail} />
      <p className="profile-quote-detail-footer">
        <Link href="/profile" className="checkout-muted-link">
          ← All quotes
        </Link>
      </p>
    </div>
  );
}
