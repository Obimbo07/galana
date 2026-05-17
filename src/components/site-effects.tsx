"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      document
        .getElementById("siteHeader")
        ?.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();

    const observe = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
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
