"use client";

import { useEffect } from "react";

export function SiteEffects() {
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
    document.querySelectorAll(".reveal").forEach((el) => observe.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observe.disconnect();
    };
  }, []);

  return null;
}
