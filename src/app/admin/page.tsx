"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { getGalanaFirebaseAuth, isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";
import type { AdminRole, QuoteRequest } from "@/types/galana-firestore";

function statusClass(s: string) {
  return `badge badge-${s.replace(/[^a-z]/g, "") || "processing"}`;
}

export default function AdminHomePage() {
  const router = useRouter();
  const clientConfigured = isGalanaFirebaseClientConfigured();
  const [items, setItems] = useState<QuoteRequest[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(clientConfigured);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    if (!clientConfigured) return;
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
        setEmail(meJ.profile?.email || user.email || "");
        setRole(meJ.profile?.role || null);

        const r = await fetch("/api/admin/quote-requests?limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.message || "Could not load requests");
        setItems(j.items as QuoteRequest[]);
        setErr(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    });
  }, [clientConfigured, router]);

  async function handleSignOut() {
    const auth = getGalanaFirebaseAuth();
    await signOut(auth);
    router.replace("/admin/login");
  }

  if (!clientConfigured) {
    return (
      <div className="admin-shell">
        <div className="admin-alert admin-alert-error">
          Add <code>NEXT_PUBLIC_FIREBASE_*</code> to enable the admin console.
        </div>
        <Link href="/">← Back</Link>
      </div>
    );
  }

  if (loading || !role) {
    return (
      <>
        {role && email ? (
          <AdminNav email={email} role={role} onSignOut={handleSignOut} />
        ) : null}
        <div className="admin-shell">
          <p className="admin-muted">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav email={email} role={role} onSignOut={handleSignOut} />
      <div className="admin-shell">
        <h1 className="admin-h1">Quote &amp; order requests</h1>
        <p className="admin-muted">
          New submissions from the site default to <strong>processing</strong>.
          Open a row to update status or add an internal note.
        </p>
        {err ? <div className="admin-alert admin-alert-error">{err}</div> : null}
        {!items?.length && !err ? (
          <p className="admin-muted">No requests yet.</p>
        ) : null}
        {items && items.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Page</th>
                </tr>
              </thead>
              <tbody>
                {items.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <Link href={`/admin/quotes/${q.id}`}>
                        {q.createdAt
                          ? new Date(q.createdAt).toLocaleString()
                          : "—"}
                      </Link>
                    </td>
                    <td>{q.kind}</td>
                    <td>
                      <span className={statusClass(q.status)}>{q.status}</span>
                    </td>
                    <td>{q.fromEmail || "—"}</td>
                    <td>{q.fromPhone || "—"}</td>
                    <td
                      style={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={q.pageUrl}
                    >
                      {q.pageUrl ? (
                        <a href={q.pageUrl} target="_blank" rel="noreferrer">
                          Link
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </>
  );
}
