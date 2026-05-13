import type { Metadata } from "next";
import { ApplyModal } from "@/components/apply-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
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
      <div className="cursor" id="cursor" />
      <div className="cursor-ring" id="cursorRing" />
      <Navbar />
      <main>
        <WhySection />
        <ContactFooter />
      </main>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <ApplyModal />
      <SiteEffects />
    </GalanaProvider>
  );
}
