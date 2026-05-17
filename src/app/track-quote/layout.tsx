import type { Metadata } from "next";
import { CheckoutSiteChrome } from "@/components/checkout-site-chrome";
import { loadSiteData } from "@/lib/load-site-data";

export const metadata: Metadata = {
  title: "Quote status — Galana Group",
  description:
    "Track your quote, payment status, and fulfilment updates with Galana Group.",
};

export default function TrackQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = loadSiteData();
  return <CheckoutSiteChrome siteData={siteData}>{children}</CheckoutSiteChrome>;
}
