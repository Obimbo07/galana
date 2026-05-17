import type { Metadata } from "next";
import { CheckoutSiteChrome } from "@/components/checkout-site-chrome";
import { loadSiteData } from "@/lib/load-site-data";

export const metadata: Metadata = {
  title: "Checkout — Galana Group",
  description:
    "Complete your quote payment securely via Paystack. Galana Group precast concrete, drainage, paving, and roofing.",
};

export default function PayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = loadSiteData();
  return <CheckoutSiteChrome siteData={siteData}>{children}</CheckoutSiteChrome>;
}
