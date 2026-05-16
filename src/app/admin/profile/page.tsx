"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { getGalanaFirebaseAuth, isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";
import type { AdminRole } from "@/types/galana-firestore";

type Profile = {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  phone: string;
  jobTitle: string;
  department: string;
  photoUrl: string;
};

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isGalanaFirebaseClientConfigured()) return;
    const auth = getGalanaFirebaseAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      try {
        const token = await user.getIdToken();
        const r = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.message || "Unauthorized");
        const p = j.profile as Profile;
        setProfile(p);
        setDisplayName(p.displayName || "");
        setPhone(p.phone || "");
        setJobTitle(p.jobTitle || "");
        setDepartment(p.department || "");
        setPhotoUrl(p.photoUrl || "");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  async function handleSignOut() {
    await signOut(getGalanaFirebaseAuth());
    router.replace("/admin/login");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const auth = getGalanaFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Session expired");
      const r = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          phone,
          jobTitle,
          department,
          photoUrl,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || "Could not save");
      setOk("Profile updated.");
      setProfile({ ...profile, displayName, phone, jobTitle, department, photoUrl });
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
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">{err || "Loading…"}</p>
      </div>
    );
  }

  return (
    <>
      <AdminNav
        email={profile.email}
        role={profile.role}
        onSignOut={handleSignOut}
      />
      <div className="admin-shell">
        <p>
          <Link href="/admin">← Requests</Link>
        </p>
        <h1 className="admin-h1">Your profile</h1>
        <p className="admin-muted">
          Visible to the team in Firestore. Role and email come from access
          control (environment allowlists); update your display details here.
        </p>
        {ok ? <div className="admin-alert">{ok}</div> : null}
        {err ? <div className="admin-alert admin-alert-error">{err}</div> : null}
        <form className="admin-card admin-form" onSubmit={(e) => void save(e)}>
          <p>
            <span
              className={`role-pill${profile.role === "admin" ? " role-pill-admin" : ""}`}
            >
              {profile.role}
            </span>
            <span className="admin-muted" style={{ marginLeft: "0.75rem" }}>
              {profile.email}
            </span>
          </p>
          <label htmlFor="dn">Display name</label>
          <input
            id="dn"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <label htmlFor="ph">Phone / WhatsApp</label>
          <input
            id="ph"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254…"
          />
          <label htmlFor="jt">Job title</label>
          <input
            id="jt"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <label htmlFor="dep">Department</label>
          <input
            id="dep"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <label htmlFor="av">Photo URL (optional)</label>
          <input
            id="av"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
          />
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={busy}
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </>
  );
}
