"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { useAuth } from "@/providers/auth-provider";

function accountInitials(user: User): string {
  const dn = user.displayName?.trim();
  if (dn) {
    const parts = dn.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0];
      const b = parts[parts.length - 1]?.[0];
      if (a && b) return `${a}${b}`.toUpperCase();
    }
    return dn.slice(0, 2).toUpperCase();
  }
  const em = user.email?.trim();
  if (em && em.length >= 2) return em.slice(0, 2).toUpperCase();
  return "?";
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconSession({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

export default function ProfileSettingsPage() {
  const { user, loading, updateDisplayName, sendPasswordResetEmail, signOut } = useAuth();
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [securityNotice, setSecurityNotice] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  useEffect(() => {
    if (user?.displayName != null) setName(user.displayName);
    else setName("");
  }, [user]);

  const initials = useMemo(() => (user ? accountInitials(user) : ""), [user]);
  const headlineName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "Your account";

  if (!loading && !user) {
    return (
      <div className="checkout-section-inner profile-settings-signed-out">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="checkout-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span style={{ color: "var(--text)" }}>Settings</span>
        </nav>
        <header className="checkout-intro reveal profile-settings-intro-empty" style={{ opacity: 1 }}>
          <div className="section-tag">Account</div>
          <h1 className="checkout-heading">
            Sign in for <em>settings</em>
          </h1>
          <p className="checkout-lead">
            Manage your display name, password recovery, and session once you&apos;re signed in.
          </p>
          <Link href="/" className="btn-outline">
            Go to homepage
          </Link>
        </header>
      </div>
    );
  }

  async function handleSaveDisplayName(e: React.FormEvent) {
    e.preventDefault();
    setProfileNotice(null);
    setSecurityNotice(null);
    setSavingName(true);
    try {
      await updateDisplayName(name);
      setProfileNotice({ ok: true, text: "Display name updated." });
    } catch (err) {
      setProfileNotice({
        ok: false,
        text: err instanceof Error ? err.message : "Could not update display name.",
      });
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordReset() {
    setProfileNotice(null);
    setSecurityNotice(null);
    setResetSending(true);
    try {
      await sendPasswordResetEmail();
      setSecurityNotice({
        ok: true,
        text: "If this account uses email & password, check your inbox for a reset link.",
      });
    } catch (err) {
      setSecurityNotice({
        ok: false,
        text: err instanceof Error ? err.message : "Could not send reset email.",
      });
    } finally {
      setResetSending(false);
    }
  }

  return (
    <div className="checkout-section-inner profile-page-inner profile-settings-page">
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="checkout-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span style={{ color: "var(--text)" }}>Settings</span>
      </nav>

      <header className="checkout-intro reveal profile-settings-intro" style={{ opacity: 1 }}>
        <div className="section-tag">Preferences</div>
        <h1 className="checkout-heading">
          Account <em>settings</em>
        </h1>
        <p className="checkout-lead profile-settings-lead">
          Keep your profile recognizable to our team and your quotes — security actions apply only to
          this browser session until you sign out elsewhere.
        </p>
      </header>

      <div className="profile-settings-layout">
        <section className="checkout-panel profile-settings-card profile-settings-card-identity">
          <div className="profile-settings-card-head">
            <div className="profile-settings-avatar" aria-hidden>
              {initials}
            </div>
            <div className="profile-settings-identity-copy">
              <p className="profile-settings-kicker">Signed in</p>
              <p className="profile-settings-display-title">{headlineName}</p>
              {user?.email ? (
                <span className="profile-settings-email-pill" title={user.email}>
                  {user.email}
                </span>
              ) : null}
            </div>
          </div>

          <div className="profile-settings-rule" />

          {profileNotice ? (
            <div
              className={
                profileNotice.ok ? "profile-settings-notice profile-settings-notice-ok" : "profile-settings-notice profile-settings-notice-err"
              }
              role="status"
            >
              {profileNotice.text}
            </div>
          ) : null}

          <form onSubmit={handleSaveDisplayName} className="profile-settings-form">
            <div className="profile-settings-field">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                className="profile-settings-input profile-settings-input-muted"
                value={user?.email ?? ""}
                disabled
                readOnly
              />
              <p className="profile-settings-hint">
                Used for sign-in and quote confirmations. Contact support to change it.
              </p>
            </div>
            <div className="profile-settings-field">
              <label htmlFor="profile-display-name">Display name</label>
              <input
                id="profile-display-name"
                type="text"
                className="profile-settings-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Wanjiru"
                autoComplete="name"
              />
              <p className="profile-settings-hint">Shown on internal paperwork and quote summaries.</p>
            </div>
            <div className="profile-settings-form-actions">
              <button type="submit" className="btn-primary" disabled={savingName}>
                {savingName ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        <div className="profile-settings-stack">
          <section className="checkout-panel profile-settings-card profile-settings-card-security">
            <div className="profile-settings-subcard-head">
              <div
                className="profile-settings-icon-badge profile-settings-icon-badge-security"
                aria-hidden
              >
                <IconLock />
              </div>
              <div className="profile-settings-subcard-intro">
                <h2 className="profile-settings-subcard-title">Password recovery</h2>
                <p className="profile-settings-subcard-tagline">
                  We&apos;ll send a secure link to your sign-in email. Other tabs stay logged in until you sign out or the session expires.
                </p>
              </div>
            </div>

            <div className="profile-settings-subcard-well profile-settings-subcard-well-security">
              {securityNotice ? (
                <div
                  className={
                    securityNotice.ok
                      ? "profile-settings-notice profile-settings-notice-ok"
                      : "profile-settings-notice profile-settings-notice-err"
                  }
                  role="status"
                >
                  {securityNotice.text}
                </div>
              ) : null}

              <button
                type="button"
                className="btn-primary profile-settings-well-primary-btn"
                disabled={resetSending || !user?.email}
                onClick={() => void handlePasswordReset()}
              >
                {resetSending ? "Sending…" : "Send reset link to email"}
              </button>
            </div>
          </section>

          <section className="checkout-panel profile-settings-card profile-settings-card-session">
            <div className="profile-settings-subcard-head">
              <div
                className="profile-settings-icon-badge profile-settings-icon-badge-session"
                aria-hidden
              >
                <IconSession />
              </div>
              <div className="profile-settings-subcard-intro">
                <h2 className="profile-settings-subcard-title">Sign out</h2>
                <p className="profile-settings-subcard-tagline">
                  Finish on shared or public devices so the next person can&apos;t access your quotes or profile.
                </p>
              </div>
            </div>

            <div className="profile-settings-subcard-well profile-settings-subcard-well-session">
              <p className="profile-settings-session-status">
                You&apos;re signed in on <strong className="profile-settings-session-strong">this browser</strong>
                {user?.email ? (
                  <>
                    {" "}
                    as <span className="profile-settings-session-email">{user.email}</span>
                  </>
                ) : null}
                .
              </p>
              <button
                type="button"
                className="btn-outline profile-settings-session-signout-btn"
                onClick={() => signOut()}
              >
                Sign out now
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
