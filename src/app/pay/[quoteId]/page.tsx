"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function routeSegmentParam(param: unknown): string | null {
  if (typeof param === "string" && param.trim()) return param.trim();
  if (Array.isArray(param) && typeof param[0] === "string" && param[0].trim()) {
    return param[0].trim();
  }
  return null;
}

/** Mobile Safari — scroll focused field above keyboard/FAB clutter */
function scrollFieldComfortable(el: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "smooth",
      });
    });
  });
}

type PaymentQuoteRes = {
  id: string;
  totalPrice: number | null;
  paymentStatus: string | null;
  fromEmail: string;
};

export default function PayPage() {
  const routeParams = useParams();
  const quoteId = routeSegmentParam(routeParams.quoteId);

  const [quote, setQuote] = useState<PaymentQuoteRes | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function mergeQuoteIntoState(res: Response) {
    const raw = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) {
      const msg =
        (typeof raw.error === "string" && raw.error) ||
        (typeof raw.message === "string" && raw.message) ||
        "Failed to load quote";
      throw new Error(msg);
    }
    const data = raw as PaymentQuoteRes;
    setQuote(data);
    setCheckoutEmail((prev) =>
      prev.trim() ? prev : (data.fromEmail?.trim() ?? "")
    );
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchQuote() {
      if (!quoteId) {
        setQuote(null);
        setError(
          "This checkout link does not include a valid quote reference. Open the Pay link from your email or confirmation."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/quote/${encodeURIComponent(quoteId)}`);
        if (!cancelled) await mergeQuoteIntoState(res);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchQuote();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  useEffect(() => {
    if (!quoteId || typeof window === "undefined") return;
    const id = quoteId;

    const url = new URL(window.location.href);
    if (url.searchParams.get("payment") !== "success") return;

    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch(`/api/quote/${encodeURIComponent(id)}`);
        if (!cancelled) await mergeQuoteIntoState(res);
        if (!cancelled) setPaymentStatus("success");
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }
    refresh();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  const handlePay = async () => {
    if (!quote) return;
    const totalPrice = quote.totalPrice;
    if (
      typeof totalPrice !== "number" ||
      totalPrice <= 0 ||
      !Number.isFinite(totalPrice)
    ) {
      setPaymentStatus("error");
      setError("Quote amount is missing or invalid.");
      return;
    }
    const email = checkoutEmail.trim();
    if (!isLikelyEmail(email)) {
      setPaymentStatus("error");
      setError("Paystack requires a valid email — enter yours below.");
      return;
    }
    setPaymentStatus("loading");
    setError(null);
    try {
      const initRes = await fetch(`/api/paystack/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          quoteId: quote.id,
        }),
      });
      const raw = await initRes.json().catch(() => ({} as Record<string, unknown>));
      if (!initRes.ok) {
        const msg =
          (typeof raw.error === "string" && raw.error) ||
          initRes.statusText ||
          "Failed to initialize payment";
        throw new Error(msg);
      }
      const authorizationUrl =
        typeof raw.authorization_url === "string"
          ? raw.authorization_url
          : null;
      if (!authorizationUrl) throw new Error("Invalid payment gateway response.");
      window.location.href = authorizationUrl;
    } catch (err) {
      setPaymentStatus("error");
      setError((err as Error).message);
    }
  };

  const payReady = !!quote?.totalPrice && isLikelyEmail(checkoutEmail);

  if (loading) {
    return (
      <div className="checkout-section-inner checkout-loading">
        <div className="checkout-spinner" aria-hidden />
        <p className="section-tag" style={{ justifyContent: "center", marginBottom: "0.5rem" }}>
          Secure checkout
        </p>
        <p style={{ margin: 0, color: "var(--muted)" }}>Fetching your quote…</p>
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className="checkout-section-inner">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span style={{ color: "var(--text)" }}>Checkout</span>
        </nav>
        <div className="checkout-result-center">
          <div className="checkout-alert">{error}</div>
          <div className="checkout-result-actions">
            <Link href="/track-quote" className="btn-outline">
              Track a quote instead
            </Link>
            <Link href="/" className="btn-primary">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="checkout-section-inner checkout-result-center">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb" style={{ justifyContent: "center" }}>
          <Link href="/">Home</Link>
        </nav>
        <h1 className="checkout-heading">
          Quote <em>not found</em>
        </h1>
        <p className="checkout-lead" style={{ marginInline: "auto" }}>
          This reference doesn&apos;t match a saved quote. Double-check your link or tracking ID.
        </p>
        <div className="checkout-result-actions">
          <Link href="/track-quote" className="btn-outline">
            Try tracking reference
          </Link>
          <Link href="/" className="btn-primary">
            Home
          </Link>
        </div>
      </div>
    );
  }

  if (quote.paymentStatus === "paid" || paymentStatus === "success") {
    return (
      <div className="checkout-section-inner checkout-result-center">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb" style={{ justifyContent: "center" }}>
          <Link href="/">Home</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span style={{ color: "var(--text)" }}>Payment received</span>
        </nav>
        <div className="checkout-success-icon" aria-hidden>
          ✓
        </div>
        <h1 className="checkout-heading">
          Thank you — payment <em>received</em>
        </h1>
        <p className="checkout-lead" style={{ marginInline: "auto", textWrap: "balance" }}>
          We&apos;ve logged your Paystack settlement for quote{" "}
          <strong style={{ color: "var(--white)" }}>{quote.id}</strong>. Fulfillment moves forward with your project team —
          monitor delivery steps anytime from tracking.
        </p>
        <div className="checkout-result-actions">
          <Link
            href={`/track-quote/${encodeURIComponent(quote.id)}`}
            className="btn-primary"
          >
            Track quote status
          </Link>
          <Link href="/" className="btn-outline">
            Return home
          </Link>
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
        <Link href="/track-quote">Track a quote</Link>
        <span className="checkout-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span style={{ color: "var(--text)" }}>Checkout</span>
      </nav>

      <header className="checkout-intro">
        <div className="section-tag">
          Secure Paystack checkout
        </div>
        <h1 className="checkout-heading">
          Complete your quote <em>payment</em>
        </h1>
        <p className="checkout-lead">
          Your charge total is taken from your official Galana quote in our system —
          confirmed on the receipt Paystack sends to the email you enter below.
        </p>
        <Link
          href={`/track-quote/${encodeURIComponent(quote.id)}`}
          className="checkout-muted-link"
        >
          Prefer to review workflow first? → Open quote tracking
        </Link>
      </header>

      <div className="checkout-pay-grid">
        <article className="checkout-panel">
          <h2 className="checkout-panel-header">How checkout works</h2>
          <div className="checkout-steps-line">
            <span>Timeline</span>
            <span className="checkout-steps-line-bar" aria-hidden />
          </div>
          <ol className="checkout-steps">
            <li>
              <strong>Verify email</strong>
              <p>
                Paystack attaches this inbox to every receipt — use the inbox you actively read.
              </p>
            </li>
            <li>
              <strong>Authorize on Paystack</strong>
              <p>You&apos;ll finish card or channel payment on Paystack&apos;s hosted page.</p>
            </li>
            <li>
              <strong>Return automatically</strong>
              <p>When Paystack redirects back, Galana confirms payment and adjusts your timeline.</p>
            </li>
          </ol>

          <div className="checkout-steps-line" style={{ marginTop: "1rem" }}>
            <span>Billing inbox</span>
            <span className="checkout-steps-line-bar" aria-hidden />
          </div>
          <form
            className="checkout-pay-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!quote.totalPrice) return;
              void handlePay();
            }}
          >
            <div
              className="form-field"
              style={{
                marginBottom: quote.totalPrice ? "1rem" : "0",
                paddingInlineStart: "0.85rem",
                maxWidth: "100%",
              }}
            >
              <label className="form-label" htmlFor="pay-checkout-email">
                Email shown to Paystack
              </label>
              <input
                id="pay-checkout-email"
                name="email"
                type="email"
                inputMode="email"
                enterKeyHint={quote.totalPrice ? "go" : "done"}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={checkoutEmail}
                onChange={(e) => setCheckoutEmail(e.target.value)}
                onFocus={(e) => scrollFieldComfortable(e.currentTarget)}
                className="form-input checkout-email-input"
                placeholder="you@example.com"
                disabled={paymentStatus === "loading"}
              />
              <p className="checkout-pay-actions-note" style={{ paddingInlineStart: 0 }}>
                Pre-filled when your quote carries an email. Fix typos before paying.
              </p>
            </div>

            {quote.totalPrice ? (
              <div className="checkout-pay-actions">
                <button
                  type="submit"
                  disabled={!payReady || paymentStatus === "loading"}
                  className="btn-primary"
                >
                  {paymentStatus === "loading" ? "Redirecting…" : "Proceed to Paystack"}
                </button>
                <p className="checkout-pay-actions-note">
                  You&apos;ll confirm the quoted KES total on Paystack&apos;s gateway before charging.
                </p>
                {paymentStatus === "error" && error ? (
                  <div className="checkout-alert">{error}</div>
                ) : null}
              </div>
            ) : (
              <div className="checkout-pay-actions">
                <p className="checkout-lead" style={{ fontSize: "0.92rem", maxWidth: "36ch" }}>
                  This quote is still awaiting a payable total — please reach out to Galana quoting so we can price it formally.
                </p>
                <Link href="/#contact" className="btn-outline">
                  Contact quoting team
                </Link>
              </div>
            )}
          </form>
        </article>

        <aside className="checkout-summary-aside-panel" aria-labelledby="checkout-summary-heading">
          <p id="checkout-summary-heading" className="checkout-summary-aside-title">
            Quote capsule
          </p>
          <div className="checkout-summary-rows">
            <div style={{ paddingBottom: "1rem", borderBottom: "1px dashed color-mix(in srgb, var(--border), transparent 42%)", paddingInlineStart: "0.15rem" }}>
              <span className="checkout-summary-k">Galana reference</span>
              <div className="checkout-quote-id-pill" style={{ marginTop: "0.5rem" }}>
                #{quote.id}
              </div>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-k">Amount due</span>
              <span className="checkout-amount-strong">
                KES{" "}
                {quote.totalPrice?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-k">Payment gateway</span>
              <span className="checkout-summary-v">Paystack</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-k">Status</span>
              <span className="checkout-summary-v">Awaiting payment</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
