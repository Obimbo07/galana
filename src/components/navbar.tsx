"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavCart } from "@/components/nav-cart";
import { NavSearch } from "@/components/nav-search";
import { NavWishlist } from "@/components/nav-wishlist";
import { NavSocialLinks } from "@/components/nav-social";
import { NavThemeToggle } from "@/components/nav-theme-toggle";
import { SiteLogo } from "@/components/site-logo";
import { SITE_LOGO_NAME_SRC } from "@/lib/site-brand";
import { useGalana } from "@/providers/galana-provider";
import { useAuth } from "@/providers/auth-provider";
import { AuthModal } from "@/components/auth-modal";

export function Navbar() {
  const { cartCount, setCartOpen, data } = useGalana();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const prevCart = useRef(cartCount);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

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
        <div className="nav-main-row">
          <Link
            href="/"
            className="nav-logo bg-transparent"
            aria-label="Galana Group home"
            onClick={() => setOpen(false)}
          >
            <SiteLogo priority heightPx={88} className="nav-logo-mark bg-blue-300" />
            <span className="nav-logo-text">
              <Image
                src={SITE_LOGO_NAME_SRC}
                alt=""
                width={696}
                height={108}
                className="nav-logo-name-img"
                priority
                aria-hidden
              />
              <span className="nav-logo-tagline" aria-hidden="true">
                At Galana You Dream We Deliver
              </span>
            </span>
          </Link>

          <div className="nav-search-wrap">
            <NavSearch />
          </div>

          <div className="nav-utilities">
            <NavWishlist onAfterNavigate={() => setOpen(false)} />
            <NavCart
              cartCount={cartCount}
              cartBump={cartBump}
              onOpenDrawer={() => {
                setCartOpen(true);
                setOpen(false);
              }}
            />
            <NavThemeToggle />
            <div className="nav-auth-slot">
              {loading ? (
                <span className="nav-auth-loading" aria-busy aria-live="polite" title="Checking sign-in">
                  …
                </span>
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="nav-profile-btn"
                    onClick={() => setOpen(false)}
                    title={user?.email ? `Signed in as ${user.email}` : "Your profile"}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="nav-signout-btn nav-signout-text"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    title="Sign out"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="nav-auth-btn"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            className="nav-menu-toggle"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-controls="primary-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        <div
          id="primary-navigation"
          className={`nav-subnav ${open ? "nav-subnav-open" : ""}`}
        >
          <ul className="nav-links">
            <li>
              <Link href="/" aria-current={isActive("/") ? "page" : undefined} onClick={() => setOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" aria-current={isActive("/services") ? "page" : undefined} onClick={() => setOpen(false)}>
                Services
              </Link>
            </li>
            <li>
              <Link href="/calculator" aria-current={isActive("/calculator") ? "page" : undefined} onClick={() => setOpen(false)}>
                Calculator
              </Link>
            </li>
            <li>
              <Link href="/products" aria-current={isActive("/products") ? "page" : undefined} onClick={() => setOpen(false)}>
                Products
              </Link>
            </li>
            <li>
              <Link href="/why-us" aria-current={isActive("/why-us") ? "page" : undefined} onClick={() => setOpen(false)}>
                Why Us
              </Link>
            </li>
            <li>
              <Link href="/careers" aria-current={isActive("/careers") ? "page" : undefined} onClick={() => setOpen(false)}>
                Careers
              </Link>
            </li>
          </ul>
          <Link
            href="/#contact"
            className="nav-cta nav-subnav-cta"
            aria-current={isActive("/#contact") ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Get a Quote
          </Link>
        </div>
      </nav>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
