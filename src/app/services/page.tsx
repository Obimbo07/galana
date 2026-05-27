import type { Metadata } from "next";
import { ApplyModal } from "@/components/apply-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { CtaStrip } from "@/components/cta-strip";
import { Navbar } from "@/components/navbar";
import { ServicesSection } from "@/components/services-section";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";

export const metadata: Metadata = {
  title: "Services — Galana Group",
  description:
    "Discover our precast concrete, drainage, roofing, and paving solutions and services.",
};

export default function ServicesPage() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main>
        <ServicesSection />
        <CtaStrip
          eyebrow="Need a custom spec?"
          title="Let our team scope, price and deliver for your project."
          sub="From bespoke precast moulds to bulk paving runs, we tailor every order. Send us your drawings or quantities and we will respond within one business day."
          actions={[
            { href: "/#contact", label: "Request a quote", variant: "primary" },
            { href: "/products", label: "Browse products", variant: "outline" },
            { href: "/calculator", label: "Calculate materials", variant: "outline" },
          ]}
        />
        <ContactFooter />
      </main>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <ApplyModal />
      <SiteEffects />
    </GalanaProvider>
  );
}
