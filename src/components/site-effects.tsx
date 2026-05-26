"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.getElementById("siteHeader");
    let ticking = false;
    const apply = () => {
      ticking = false;
      header?.classList.toggle("scrolled", window.scrollY > 60);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();

    const observe = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      /**
       * `threshold: 0.1` left tall blocks effectively invisible (`opacity:0`) until ~10%
       * was visible — on phones that reads as a dead zone where taps hit empty layers.
       * Activate as soon as any pixel crosses the viewport; eager margins reduce races while scrolling.
       */
      { threshold: 0, rootMargin: "120px 0px 160px 0px" }
    );

    /** Re-scan on pathname change — client-rendered `.reveal` blocks would otherwise stay opacity:0 forever. */
    document.querySelectorAll(".reveal").forEach((el) => observe.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observe.disconnect();
    };
  }, [pathname]);

  return null;
}
