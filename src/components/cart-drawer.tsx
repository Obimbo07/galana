"use client";

import { useGalana } from "@/providers/galana-provider";

export function CartDrawer() {
  const {
    cartLines,
    cartOpen,
    setCartOpen,
    setQty,
    setLineNote,
    removeLine,
    scrollToCalculatorAndOpenQuote,
  } = useGalana();

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
          <button
            type="button"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={scrollToCalculatorAndOpenQuote}
          >
            Send quote / Request quote
          </button>
        </div>
      </div>
    </div>
  );
}
