"use client";

import { useEffect } from "react";

export function SiteEffects() {
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursorRing");
    if (!cursor || !ring) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let id = 0;
    if (!reduceMotion) {
      id = window.setInterval(() => {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      }, 16);
    }

    document.addEventListener("mousemove", onMove);
    const syncRingToCursor = reduceMotion
      ? (e: MouseEvent) => {
          ring.style.transform = `translate(${e.clientX - 18}px, ${
            e.clientY - 18
          }px)`;
        }
      : null;
    if (syncRingToCursor) document.addEventListener("mousemove", syncRingToCursor);

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

    const hookHover = () => {
      document
        .querySelectorAll(
          "a,button,.product-card,.service-card,.job-card,.calc-tab,.nav-cart-btn,.help-fab-wa,.help-fab-ai,.cart-drawer-close,.nav-menu-toggle"
        )
        .forEach((el) => {
          const h = el as HTMLElement;
          if (h.dataset.cursorHooked) return;
          h.dataset.cursorHooked = "1";
          h.addEventListener("mouseenter", () => {
            ring.style.borderColor = "var(--blue-light)";
          });
          h.addEventListener("mouseleave", () => {
            ring.style.borderColor = "var(--blue)";
          });
        });
    };
    hookHover();
    const mo = new MutationObserver(hookHover);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      if (syncRingToCursor)
        document.removeEventListener("mousemove", syncRingToCursor);
      window.removeEventListener("scroll", onScroll);
      if (id) window.clearInterval(id);
      observe.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
