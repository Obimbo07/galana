import type { Metadata } from "next";
import { ApplyModal } from "@/components/apply-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { Navbar } from "@/components/navbar";
import { ProductsSection } from "@/components/products-section";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";

export const metadata: Metadata = {
  title: "Products — Galana Group",
  description:
    "Browse our complete range of precast concrete, drainage, roofing, and paving products.",
};

export default function ProductsPage() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main>
        <ProductsSection variant="store" />
        <ContactFooter />
      </main>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <ApplyModal />
      <SiteEffects />
    </GalanaProvider>
  );
}
