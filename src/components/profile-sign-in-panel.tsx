"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";

export function ProfileSignInPanel() {
  const [authOpen, setAuthOpen] = useState(false);
  const firebaseReady = isGalanaFirebaseClientConfigured();

  return (
    <>
      <div className="checkout-section-inner profile-sign-in-panel">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span style={{ color: "var(--text)" }}>Your quotes</span>
        </nav>
        <header className="checkout-intro reveal" style={{ opacity: 1 }}>
          <h1 className="checkout-heading">
            Sign in to your <em>quotes dashboard</em>
          </h1>
          <p className="checkout-lead">
            Track quote requests, orders, and project updates tied to your
            account. Use the same email you submit on contact and checkout forms.
          </p>
          {!firebaseReady ? (
            <p className="profile-sign-in-hint" role="status">
              Account sign-in requires Firebase configuration in{" "}
              <code>.env.local</code> (NEXT_PUBLIC_FIREBASE_*). Restart the dev
              server after adding keys.
            </p>
          ) : null}
          <div className="profile-sign-in-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setAuthOpen(true)}
              disabled={!firebaseReady}
            >
              Sign in
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setAuthOpen(true)}
              disabled={!firebaseReady}
            >
              Create account
            </button>
            <Link href="/" className="btn-outline">
              Back to home
            </Link>
          </div>
        </header>
      </div>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo="/profile"
      />
    </>
  );
}
