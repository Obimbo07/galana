import { ApplyModal } from "@/components/apply-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { CalculatorSection } from "@/components/calculator-section";
import { CtaStrip } from "@/components/cta-strip";
import { Hero } from "@/components/hero";
import { ProductShowcaseSection } from "@/components/product-showcase-section";
import { ProductsSectionHomeSkeleton } from "@/components/products-loading";
import { ProductsSection } from "@/components/products-section";
import { ServicesCarousel } from "@/components/services-carousel";
// import { TrustedBySection } from "@/components/trusted-by-section";
import { Navbar } from "@/components/navbar";
import { SiteEffects } from "@/components/site-effects";
import { SupportWidget } from "@/components/support-widget";
import { GalanaProvider } from "@/providers/galana-provider";
import { loadSiteData } from "@/lib/load-site-data";
import { Suspense } from "react";

export default function Home() {
  const siteData = loadSiteData();

  return (
    <GalanaProvider data={siteData}>
      <Navbar />
      <main>
        <Hero />
        <ProductShowcaseSection />
        <ServicesCarousel />
        {/* <TrustedBySection /> — re-enable once partner logos are ready */}
        <CalculatorSection />
        <Suspense fallback={<ProductsSectionHomeSkeleton />}>
          <ProductsSection variant="home" />
        </Suspense>
        <CtaStrip />
        <ContactFooter />
      </main>
      <CartDrawer />
      <SupportWidget data={siteData} />
      <ApplyModal />
      <SiteEffects />
    </GalanaProvider>
  );
}
