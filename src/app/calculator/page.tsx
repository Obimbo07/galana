import type { Metadata } from "next";
import { ApplyModal } from "@/components/apply-modal";
import { CalculatorSection } from "@/components/calculator-section";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { CtaStrip } from "@/components/cta-strip";
import { Navbar } from "@/components/navbar";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";

export const metadata: Metadata = {
  title: "Calculator — Galana Group",
  description:
    "Calculate material quantities for paving, blocks, and more with our interactive calculator.",
};

export default function CalculatorPage() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main>
        <CalculatorSection />
        <CtaStrip
          eyebrow="Take it further"
          title="Numbers ready? Turn them into a real order."
          sub="Drop your calculated quantities into a quote, browse matching products, or speak with our advisors for delivery scheduling."
          actions={[
            { href: "/products", label: "View products", variant: "primary" },
            { href: "/#contact", label: "Talk to us", variant: "outline" },
            { href: "/services", label: "See services", variant: "outline" },
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
