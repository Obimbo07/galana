import type { Metadata } from "next";
import { ApplyModal } from "@/components/apply-modal";
import { CareersJobsGrid, CareersPageIntro } from "@/components/careers-jobs-grid";
import { CartDrawer } from "@/components/cart-drawer";
import { Navbar } from "@/components/navbar";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";

export const metadata: Metadata = {
  title: "Careers — Galana Group",
  description:
    "Explore roles at Galana Group — concrete, precast, and infrastructure careers in Kenya and East Africa.",
};

export default function CareersPage() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main className="site-main-offset careers-page-main">
        <div className="section-inner careers-page-inner">
          <CareersPageIntro />
          <CareersJobsGrid />
        </div>
      </main>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <ApplyModal />
      <SiteEffects />
    </GalanaProvider>
  );
}
