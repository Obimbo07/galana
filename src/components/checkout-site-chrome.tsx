"use client";

import Link from "next/link";
import type { SiteData } from "@/types/site-data";
import { CartDrawer } from "@/components/cart-drawer";
import { Navbar } from "@/components/navbar";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";

export function CheckoutSiteChrome({
  children,
  siteData,
}: {
  children: React.ReactNode;
  siteData: SiteData;
}) {
  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main className="checkout-main-wrap">{children}</main>
      <footer className="checkout-footer-mini" aria-label="Checkout footer">
        <div className="section-inner checkout-footer-inner">
          <span className="checkout-footer-chip">Quotes & settlements</span>
          <nav className="checkout-footer-links" aria-label="Quick links">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/calculator">Calculator</Link>
            <Link href="/track-quote">Track a quote</Link>
          </nav>
          <p className="checkout-footer-meta">
            {siteData.contact?.phoneDisplay
              ? `Need help? ${siteData.contact.phoneDisplay}`
              : "Galana Group — At Galana You Dream We Deliver"}
          </p>
        </div>
      </footer>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <SiteEffects />
    </GalanaProvider>
  );
}
