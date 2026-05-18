"use client";

import { useGalana } from "@/providers/galana-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CartDrawer() {
  const {
    cartLines,
    cartOpen,
    setCartOpen,
    setQty,
    setLineNote,
    removeLine,
    scrollToCalculatorAndOpenQuote,
    quoteEmail,
    setQuoteEmail,
    quotePhone,
    setQuotePhone,
    quoteLocation,
    setQuoteLocation,
    postQuoteApi,
    downloadQuotePdf,
  } = useGalana();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <div
      className={`cart-drawer-overlay${cartOpen ? " open" : ""}`}
      id="cartDrawerOverlay"
      aria-hidden={!cartOpen}
      onClick={(e) => {
        if (e.target === e.currentTarget) setCartOpen(false);
      }}
    >
      <div
        className="cart-drawer"
        id="cartDrawer"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="cart-drawer-head">
          <h3>Your cart</h3>
          <button
            type="button"
            className="cart-drawer-close"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="cart-drawer-lines" id="cartDrawerLines">
          {!cartLines.length ? (
            <div className="cart-empty-msg">
              Cart is empty. Add products from the catalog.
            </div>
          ) : (
            cartLines.map((l) => (
              <div className="cart-line" key={l.id} data-id={l.id}>
                <div className="cart-line-name">{l.name}</div>
                <div className="cart-line-meta">{l.catLabel}</div>
                <div className="cart-qty-row">
                  <label htmlFor={`qty-${l.id}`}>Qty</label>
                  <input
                    id={`qty-${l.id}`}
                    type="number"
                    min={1}
                    value={l.qty}
                    aria-label={`Quantity for ${l.name}`}
                    onChange={(e) => setQty(l.id, e.target.value)}
                  />
                  <button type="button" onClick={() => removeLine(l.id)}>
                    Remove
                  </button>
                </div>
                <textarea
                  placeholder="Line note (sizes, colour, site…)"
                  value={l.note}
                  onChange={(e) => setLineNote(l.id, e.target.value)}
                />
              </div>
            ))
          )}
        </div>
        <div className="cart-drawer-foot">
          <div className="cart-drawer-quote-fields">
            <h4 className="cart-drawer-quote-heading">Quote details</h4>
            <p className="cart-drawer-quote-note">
              All optional — add what you have so we can reach you.
            </p>
            <label className="cart-drawer-label" htmlFor="cartQuoteEmail">
              Email
            </label>
            <input
              id="cartQuoteEmail"
              type="email"
              className="cart-drawer-input"
              placeholder="you@company.com"
              autoComplete="email"
              value={quoteEmail}
              onChange={(e) => setQuoteEmail(e.target.value)}
            />
            <label className="cart-drawer-label" htmlFor="cartQuotePhone">
              Phone / WhatsApp
            </label>
            <input
              id="cartQuotePhone"
              type="tel"
              className="cart-drawer-input"
              placeholder="+254…"
              autoComplete="tel"
              value={quotePhone}
              onChange={(e) => setQuotePhone(e.target.value)}
            />
            <label className="cart-drawer-label" htmlFor="cartQuoteLoc">
              Location
            </label>
            <input
              id="cartQuoteLoc"
              type="text"
              className="cart-drawer-input"
              placeholder="City, site, county…"
              value={quoteLocation}
              onChange={(e) => setQuoteLocation(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const res = await postQuoteApi({ source: "cart" });
                if (!res.ok) {
                  window.alert(res.message);
                  return;
                }
                if (res.id) {
                  try {
                    await downloadQuotePdf(res.id);
                    window.alert(
                      `Quote saved (reference ${res.id}). Your PDF download should start.`
                    );
                    router.push(`/pay/${res.id}`);
                  } catch (e) {
                    window.alert(
                      e instanceof Error
                        ? e.message
                        : "PDF download failed. The quote is still saved."
                    );
                    router.push(`/pay/${res.id}`);
                  }
                } else {
                  window.alert(
                    "Could not save a quote copy. Configure FIREBASE_SERVICE_ACCOUNT_JSON to enable saving and PDF."
                  );
                }
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving…" : "Save quote & download PDF"}
          </button>
          <button
            type="button"
            className="btn-outline"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "0.55rem",
            }}
            onClick={scrollToCalculatorAndOpenQuote}
          >
            Open calculator quote form
          </button>
        </div>
      </div>
    </div>
  );
}
