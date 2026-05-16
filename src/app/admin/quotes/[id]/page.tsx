"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { getGalanaFirebaseAuth, isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";
import type { AdminRole, QuoteRequest, QuoteRequestStatus } from "@/types/galana-firestore";
import { downloadQuotePdfClient } from "@/providers/galana-provider";

const STATUSES: QuoteRequestStatus[] = [
  "processing",
  "quoted",
  "confirmed",
  "declined",
  "archived",
];

export default function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [item, setItem] = useState<QuoteRequest | null>(null);
  const [status, setStatus] = useState<QuoteRequestStatus>("processing");
  const [internalNote, setInternalNote] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await params;
      if (!cancelled) setId(p.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!id || !isGalanaFirebaseClientConfigured()) return;
    const auth = getGalanaFirebaseAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      try {
        const token = await user.getIdToken();
        const me = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meJ = await me.json().catch(() => ({}));
        if (!me.ok) {
          await signOut(auth);
          router.replace("/admin/login");
          return;
        }
        setEmail(meJ.profile?.email || "");
        setRole(meJ.profile?.role || "staff");

        const r = await fetch(`/api/admin/quote-requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.message || "Not found");
        const q = j.item as QuoteRequest;
        setItem(q);
        setStatus(q.status);
        setInternalNote(q.internalNote || "");
        setErr(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    });
  }, [id, router]);

  async function handleSignOut() {
    await signOut(getGalanaFirebaseAuth());
    router.replace("/admin/login");
  }

  async function save() {
    if (!id) return;
    setBusy(true);
    setErr(null);
    try {
      const auth = getGalanaFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Session expired");
      const r = await fetch(`/api/admin/quote-requests/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, internalNote }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || "Save failed");
      setItem(j.item as QuoteRequest);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!isGalanaFirebaseClientConfigured()) {
    return (
      <div className="admin-shell">
        <div className="admin-alert admin-alert-error">
          Firebase client is not configured.
        </div>
        <Link href="/">← Back</Link>
      </div>
    );
  }

  if (loading || !role || !id) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <AdminNav email={email} role={role} onSignOut={handleSignOut} />
      <div className="admin-shell">
        <p>
          <Link href="/admin">← All requests</Link>
        </p>
        <h1 className="admin-h1">Request {id}</h1>
        {err ? <div className="admin-alert admin-alert-error">{err}</div> : null}
        {!item ? (
          <p className="admin-muted">Not found.</p>
        ) : (
          <>
            <div className="admin-card admin-form">
              <label htmlFor="st">Status</label>
              <select
                id="st"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as QuoteRequestStatus)
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label htmlFor="note">Internal note (team only)</label>
              <textarea
                id="note"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Pricing notes, follow-up, assignment…"
              />
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => void save()}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save updates"}
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ marginLeft: "0.65rem" }}
                onClick={() => {
                  if (!id) return;
                  void (async () => {
                    try {
                      await downloadQuotePdfClient(id);
                    } catch (e) {
                      window.alert(
                        e instanceof Error ? e.message : "Could not download PDF."
                      );
                    }
                  })();
                }}
              >
                Download PDF
              </button>
            </div>
            <div className="admin-card">
              <h2 className="admin-h1" style={{ fontSize: "1.1rem" }}>
                Payload
              </h2>
              <pre className="admin-pre">
                {JSON.stringify(item.payload, null, 2)}
              </pre>
            </div>
            <div className="admin-muted" style={{ fontSize: "0.8rem" }}>
              Created: {item.createdAt || "—"} · Updated:{" "}
              {item.updatedAt || "—"}
            </div>
          </>
        )}
      </div>
    </>
  );
}
