import { ApplyModal } from "@/components/apply-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { CalculatorSection } from "@/components/calculator-section";
import { Hero } from "@/components/hero";
import { ProductsSection } from "@/components/products-section";
import { Navbar } from "@/components/navbar";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";

export default function Home() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main>
        <Hero />
        <CalculatorSection />
        <ProductsSection />
        <ContactFooter />
      </main>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <ApplyModal />
      <SiteEffects />
    </GalanaProvider>
  );
}
