"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/providers/auth-provider";
import { isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** After successful sign-in or sign-up, navigate here (default: profile quotes dashboard). */
  redirectTo?: string;
}

function formatAuthError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code?: string }).code);
    const map: Record<string, string> = {
      "auth/invalid-credential": "Invalid email or password.",
      "auth/user-not-found": "No account found for this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/popup-closed-by-user": "Sign-in was cancelled.",
      "auth/popup-blocked": "Pop-up blocked. Allow pop-ups for this site to use Google sign-in.",
      "auth/cancelled-popup-request": "Sign-in was cancelled.",
      "auth/account-exists-with-different-credential":
        "An account already exists with this email using a different sign-in method.",
    };
    if (map[code]) return map[code];
    return code.replace("auth/", "").replace(/-/g, " ");
  }
  if (err instanceof Error && err.message) return err.message;
  return "Authentication failed. Please try again.";
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthModal({
  isOpen,
  onClose,
  redirectTo = "/profile",
}: AuthModalProps) {
  const router = useRouter();
  const formId = useId();
  const canPortal = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const firebaseReady = isGalanaFirebaseClientConfigured();

  const handleClose = useCallback(() => {
    setError(null);
    setLoading(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, handleClose]);

  async function finishAuth() {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setLoading(false);
    onClose();
    router.push(redirectTo);
  }

  async function handleGoogle() {
    if (!firebaseReady) {
      setError(
        "Sign-in is not configured. Add Firebase keys to .env.local and restart the dev server."
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      await finishAuth();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseReady) {
      setError(
        "Sign-in is not configured. Add Firebase keys to .env.local and restart the dev server."
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName || undefined);
      }
      await finishAuth();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  if (!canPortal || !isOpen) return null;

  const modal = (
    <div
      className={`auth-modal-overlay${isOpen ? " open" : ""}`}
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close"
          aria-label="Close sign in dialog"
          onClick={handleClose}
        >
          ✕
        </button>

        <div className="auth-modal-scroll">
          <h2 id={`${formId}-title`} className="auth-modal-title">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>
          <p className="auth-modal-lede">
            {mode === "signin"
              ? "Access your quotes dashboard and track project requests."
              : "Create an account to save quotes and follow up in one place."}
          </p>

          {(error || !firebaseReady) && (
            <div className="auth-modal-alerts" role="status" aria-live="polite">
              {!firebaseReady ? (
                <div className="auth-modal-error" role="alert">
                  Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* in
                  .env.local and restart the app.
                </div>
              ) : null}
              {error ? (
                <div className="auth-modal-error" role="alert">
                  {error}
                </div>
              ) : null}
            </div>
          )}

          <button
            type="button"
            className="auth-google-btn"
            disabled={loading || !firebaseReady}
            onClick={handleGoogle}
          >
            <GoogleMark />
            <span>Continue with Google</span>
          </button>

          <p className="auth-modal-divider" role="separator">
            <span>or use email</span>
          </p>

          <form onSubmit={handleSubmit} className="auth-modal-form">
            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor={`${formId}-name`}>Full Name (optional)</label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="auth-field">
              <label htmlFor={`${formId}-email`}>Email</label>
              <input
                id={`${formId}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor={`${formId}-password`}>Password</label>
              <input
                id={`${formId}-password`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign In with Email"
                  : "Create Account with Email"}
            </button>
          </form>

          <p className="auth-toggle-mode">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
