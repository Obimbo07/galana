"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NavSocialLinks } from "@/components/nav-social";
import { useGalana } from "@/providers/galana-provider";

const NavThemeToggle = dynamic(
  () =>
    import("@/components/nav-theme-toggle").then((m) => ({
      default: m.NavThemeToggle,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="nav-theme nav-theme-pending" aria-hidden="true" />
    ),
  }
);

export function Navbar() {
  const { cartCount, setCartOpen, data } = useGalana();
  const [open, setOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const prevCart = useRef(cartCount);

  useEffect(() => {
    if (prevCart.current !== cartCount && cartCount > 0) {
      setCartBump(true);
      const t = window.setTimeout(() => setCartBump(false), 500);
      return () => window.clearTimeout(t);
    }
    prevCart.current = cartCount;
  }, [cartCount]);

  return (
    <header id="siteHeader" className="site-header">
      <div
        className="nav-top-bar"
        aria-label="Company tagline and social profiles"
      >
        <div className="nav-top-inner">
          <p className="nav-tagline">{data.footer.tagline}</p>
          <NavSocialLinks social={data.social} />
        </div>
      </div>
      <nav id="navbar">
        <Link href="/" className="nav-logo bg-transparent" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo2.png"
            alt="Galana Group"
            width={180}
            height={180}
            priority
            style={{ height: 52, width: "auto" }}
          />
        </Link>
        <button
          type="button"
          className="nav-menu-toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
        <ul className={`nav-links ${open ? "nav-links-open" : ""}`}>
          <li>
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/services" onClick={() => setOpen(false)}>
              Services
            </Link>
          </li>
          <li>
            <Link href="/calculator" onClick={() => setOpen(false)}>
              Calculator
            </Link>
          </li>
          <li>
            <Link href="/products" onClick={() => setOpen(false)}>
              Products
            </Link>
          </li>
          <li>
            <Link href="/why-us" onClick={() => setOpen(false)}>
              Why Us
            </Link>
          </li>
          <li>
            <Link href="/careers" onClick={() => setOpen(false)}>
              Careers
            </Link>
          </li>
          <li className="nav-theme-wrap">
            <NavThemeToggle onChoice={() => setOpen(false)} />
          </li>
          <li>
            <button
              type="button"
              className="nav-cart-btn"
              aria-label="Open cart"
              onClick={() => {
                setCartOpen(true);
                setOpen(false);
              }}
            >
              Cart{" "}
              <span
                className={`nav-cart-count${cartBump ? " nav-cart-count-bump" : ""}`}
                data-empty={cartCount ? "0" : "1"}
              >
                {cartCount}
              </span>
            </button>
          </li>
          <li>
            <Link
              href="/#contact"
              className="nav-cta"
              onClick={() => setOpen(false)}
            >
              Get a Quote
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
