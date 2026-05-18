"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div
        className="checkout-section-inner checkout-loading"
        style={{ minHeight: "42vh", justifyContent: "center" }}
      >
        <div className="checkout-spinner" aria-hidden />
        <p style={{ margin: "0.75rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
          Checking sign-in status…
        </p>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const quotesActive =
    pathname === "/profile" || pathname.startsWith("/profile/quotes");
  const settingsActive = pathname.startsWith("/profile/settings");

  return (
    <div className="profile-shell">
      <aside className="profile-shell-nav" aria-label="Profile sections">
        <p className="profile-shell-heading">Account</p>
        <ul className="profile-shell-links">
          <li>
            <Link
              href="/profile"
              className={`profile-shell-link${quotesActive ? " profile-shell-link-active" : ""}`}
              aria-current={quotesActive ? "page" : undefined}
            >
              Quotes
            </Link>
          </li>
          <li>
            <Link
              href="/profile/settings"
              className={`profile-shell-link${settingsActive ? " profile-shell-link-active" : ""}`}
              aria-current={settingsActive ? "page" : undefined}
            >
              Settings
            </Link>
          </li>
        </ul>
      </aside>
      <div className="profile-shell-main">{children}</div>
    </div>
  );
}
