"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getGalanaFirebaseAuth, isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isGalanaFirebaseClientConfigured()) {
    return (
      <div className="admin-shell">
        <div className="admin-alert admin-alert-error">
          Firebase client variables are missing. Add{" "}
          <code>NEXT_PUBLIC_FIREBASE_*</code> from your Firebase project (see{" "}
          <code>.env.example</code>).
        </div>
        <Link href="/">← Back to site</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const auth = getGalanaFirebaseAuth();
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const token = await cred.user.getIdToken();
      const r = await fetch("/api/admin/ensure-profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        await auth.signOut();
        setErr(
          (j && j.message) ||
            "Sign-in worked, but this account is not provisioned for admin."
        );
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      const msg =
        e && typeof e === "object" && "code" in e
          ? String((e as { code?: string }).code)
          : "Sign-in failed";
      setErr(msg.replace("auth/", "").replace(/-/g, " "));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login-box admin-card">
      <h1 className="admin-h1">Galana admin</h1>
      <p className="admin-muted">
        Sign in with a Firebase Auth account listed in{" "}
        <code>GALANA_ADMIN_EMAILS</code> or <code>GALANA_STAFF_EMAILS</code>.
      </p>
      {err ? <div className="admin-alert admin-alert-error">{err}</div> : null}
      <form className="admin-form" onSubmit={onSubmit}>
        <label htmlFor="adm-email">Email</label>
        <input
          id="adm-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="adm-pass">Password</label>
        <input
          id="adm-pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={busy}
          style={{ width: "100%", maxWidth: 420 }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">← Public website</Link>
      </p>
    </div>
  );
}
