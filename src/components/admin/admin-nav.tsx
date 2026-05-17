"use client";

import Link from "next/link";
import type { AdminRole } from "@/types/galana-firestore";

export function AdminNav(props: {
  email: string;
  role: AdminRole;
  onSignOut: () => void;
}) {
  return (
    <header className="admin-nav">
      <Link href="/admin" className="admin-nav-brand">
        Galana admin
      </Link>
      <nav className="admin-nav-links" aria-label="Admin">
        <Link href="/admin">Requests</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/calculator">Calculator</Link>
        <Link href="/admin/profile">Profile</Link>
        <span className="admin-muted" style={{ fontSize: "0.8rem" }}>
          {props.email}
        </span>
        <span
          className={`role-pill${props.role === "admin" ? " role-pill-admin" : ""}`}
        >
          {props.role}
        </span>
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={props.onSignOut}
        >
          Sign out
        </button>
      </nav>
    </header>
  );
}
