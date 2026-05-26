import type { Metadata } from "next";
import { ApplyModal } from "@/components/apply-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { CtaStrip } from "@/components/cta-strip";
import { Navbar } from "@/components/navbar";
import { WhySection } from "@/components/why-section";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";

export const metadata: Metadata = {
  title: "Why Us — Galana Group",
  description:
    "Learn why Galana Group is Kenya's trusted partner for precast concrete and building materials.",
};

export default function WhyUsPage() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main>
        <WhySection />
        <CtaStrip
          eyebrow="Ready to build with us?"
          title="Partner with the team trusted on Kenya's most demanding sites."
          sub="Reliable lead times, consistent grade, and engineers on call. Start a conversation or run the numbers in seconds."
          actions={[
            { href: "/#contact", label: "Get a quote", variant: "primary" },
            { href: "/calculator", label: "Calculate materials", variant: "outline" },
            { href: "/products", label: "Explore catalogue", variant: "outline" },
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
