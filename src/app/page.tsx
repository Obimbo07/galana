import { ApplyModal } from "@/components/apply-modal";
import { CalculatorSection } from "@/components/calculator-section";
import { CareersSection } from "@/components/careers-section";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { ProductsSection } from "@/components/products-section";
import { ServicesSection } from "@/components/services-section";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { WhySection } from "@/components/why-section";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";

export default function Home() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <div className="cursor" id="cursor" />
      <div className="cursor-ring" id="cursorRing" />
      <Navbar />
      <main>
        <Hero />
        <ServicesSection />
        <CalculatorSection />
        <ProductsSection />
        <WhySection />
        <CareersSection />
        <ContactFooter />
      </main>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <ApplyModal />
      <SiteEffects />
    </GalanaProvider>
  );
}
