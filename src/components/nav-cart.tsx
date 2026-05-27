"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGalana } from "@/providers/galana-provider";

interface NavCartProps {
  cartCount: number;
  cartBump: boolean;
  onOpenDrawer: () => void;
}

export function NavCart({ cartCount, cartBump, onOpenDrawer }: NavCartProps) {
  const { cartLines, data, removeLine, setCartOpen } = useGalana();
  const [previewOpen, setPreviewOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  const productsById = useMemo(() => {
    const m = new Map<string, (typeof data.products)[number]>();
    for (const p of data.products) m.set(p.id, p);
    return m;
  }, [data.products]);

  const previewLines = cartLines.slice(0, 4);
  const moreCount = Math.max(0, cartLines.length - previewLines.length);

  useEffect(() => {
    if (!previewOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setPreviewOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [previewOpen]);

  function scheduleHide() {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPreviewOpen(false), 180);
  }
  function cancelHide() {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  return (
    <div
      className="nav-cart-wrap"
      ref={wrapRef}
      onMouseEnter={() => {
        cancelHide();
        setPreviewOpen(true);
      }}
      onMouseLeave={scheduleHide}
      onFocus={() => {
        cancelHide();
        setPreviewOpen(true);
      }}
      onBlur={scheduleHide}
    >
      <button
        type="button"
        className="nav-cart-btn"
        aria-label={`Open cart (${cartCount} item${cartCount === 1 ? "" : "s"})`}
        aria-haspopup="dialog"
        aria-expanded={previewOpen}
        onClick={onOpenDrawer}
      >
        <svg
          className="nav-cart-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1.4" />
          <circle cx="18" cy="21" r="1.4" />
          <path d="M3 3h2.2l2.3 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.55L21.5 7H6" />
        </svg>
        <span className="nav-cart-label">Cart</span>
        <span
          className={`nav-cart-count${cartBump ? " nav-cart-count-bump" : ""}`}
          data-empty={cartCount ? "0" : "1"}
          aria-hidden="true"
        >
          {cartCount}
        </span>
      </button>

      {previewOpen ? (
        <div className="nav-cart-preview" role="dialog" aria-label="Cart preview">
          <div className="nav-cart-preview-head">
            <span className="nav-cart-preview-title">Your cart</span>
            <span className="nav-cart-preview-count">
              {cartCount} item{cartCount === 1 ? "" : "s"}
            </span>
          </div>

          {cartLines.length === 0 ? (
            <div className="nav-cart-preview-empty">
              <span aria-hidden="true">🛒</span>
              <p>Your cart is empty.</p>
              <span className="nav-cart-preview-empty-hint">
                Browse products and tap “Add to cart”.
              </span>
            </div>
          ) : (
            <>
              <ul className="nav-cart-preview-list">
                {previewLines.map((l) => {
                  const prod = productsById.get(l.id);
                  return (
                    <li key={l.id} className="nav-cart-preview-item">
                      <span className="nav-cart-preview-thumb" aria-hidden="true">
                        {prod?.image ? (
                          <Image src={prod.image} alt="" fill sizes="48px" />
                        ) : null}
                      </span>
                      <span className="nav-cart-preview-meta">
                        <span className="nav-cart-preview-name">{l.name}</span>
                        <span className="nav-cart-preview-cat">
                          {l.catLabel} · Qty {l.qty}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="nav-cart-preview-remove"
                        aria-label={`Remove ${l.name} from cart`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLine(l.id);
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
              {moreCount > 0 ? (
                <div className="nav-cart-preview-more">
                  +{moreCount} more item{moreCount === 1 ? "" : "s"}
                </div>
              ) : null}
              <div className="nav-cart-preview-actions">
                <button
                  type="button"
                  className="btn-outline nav-cart-preview-view"
                  onClick={() => {
                    setPreviewOpen(false);
                    setCartOpen(true);
                  }}
                >
                  View cart
                </button>
                <button
                  type="button"
                  className="btn-primary nav-cart-preview-checkout"
                  onClick={() => {
                    setPreviewOpen(false);
                    setCartOpen(true);
                  }}
                >
                  Request quote →
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
