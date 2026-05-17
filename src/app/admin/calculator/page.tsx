"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getGalanaFirebaseAuth, isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";
import type { SiteData } from "@/types/site-data";

type CalculatorSettings = SiteData['calculator'];
type PavingOption = SiteData['calculator']['paving']['blocksPerM2Options'][number];
type PipeType = SiteData['calculator']['pipes']['pipeTypes'][number];
type TileType = SiteData['calculator']['roofing']['tileTypes'][number];

export default function AdminCalculatorPage() {
  const router = useRouter();
  const clientConfigured = isGalanaFirebaseClientConfigured();
  const [calc, setCalc] = useState<CalculatorSettings | null>(null);
  const [loading, setLoading] = useState(clientConfigured);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientConfigured) return;
    const fetchCalc = async () => {
      try {
        const auth = getGalanaFirebaseAuth();
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          router.replace("/admin/login");
          return;
        }
        const res = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          await auth.signOut();
          router.replace("/admin/login");
          return;
        }
        const dataRes = await fetch("/api/admin/calculator-settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dataRes.ok) throw new Error("Failed to fetch calculator settings");
        const data = await dataRes.json();
        setCalc(data.calculator);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchCalc();
  }, [clientConfigured, router]);

  const handleChange = (
    section: keyof CalculatorSettings,
    field: string,
    value: number,
  ) => {
    setCalc((prev) => {
      if (!prev) return prev;
      const slice = prev[section];
      return {
        ...prev,
        [section]: { ...slice, [field]: value },
      };
    });
  };

  const handleSave = async () => {
    if (!calc) return;
    setSaving(true);
    setError(null);
    try {
      const auth = getGalanaFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch("/api/admin/calculator-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ calculator: calc }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save calculator settings");
      }
      // Optionally show a success message
      alert("Calculator settings saved successfully!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-shell">
        <div className="admin-alert admin-alert-error">{error}</div>
        <Link href="/admin">← Back</Link>
      </div>
    );
  }

  if (!calc) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">No calculator settings found.</p>
        <Link href="/admin">← Back</Link>
      </div>
    );
  }

  return (
    <>
      <div className="admin-shell">
        <h1 className="admin-h1">Calculator Settings</h1>
        <p className="admin-muted">
          Edit default wastage percentages and options for paving, pipes, and roofing calculators.
        </p>

        <div className="admin-section">
          <h2>Paving</h2>
          <div className="admin-field">
            <label>Default Wastage Percent:</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={calc?.paving.defaultWastagePercent ?? 0}
              onChange={(e) => handleChange("paving", "defaultWastagePercent", parseFloat(e.target.value) || 0)}
              disabled={saving}
              className="admin-input"
            />
          </div>
          <div className="admin-field">
            <label>Blocks Per M2 Options:</label>
            {calc?.paving.blocksPerM2Options.map((opt: PavingOption, index: number) => (
              <div key={opt.id} className="admin-field-inline">
                <label>
                  {opt.label} ({opt.blocksPerM2} blocks/m²):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={opt.blocksPerM2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const opts = [...(calc?.paving.blocksPerM2Options ?? [])];
                    opts[index] = { ...opts[index], blocksPerM2: val };
                    setCalc((prev) => ({
                      ...prev!,
                      paving: { ...prev!.paving, blocksPerM2Options: opts },
                    }));
                  }}
                  disabled={saving}
                  className="admin-input admin-input-small"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h2>Pipes</h2>
          <div className="admin-field">
            <label>Default Extra Percent:</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={calc?.pipes.defaultExtraPercent ?? 0}
              onChange={(e) => handleChange("pipes", "defaultExtraPercent", parseFloat(e.target.value) || 0)}
              disabled={saving}
              className="admin-input"
            />
          </div>
          <div className="admin-field">
            <label>Pipe Types (Section M):</label>
            {calc?.pipes.pipeTypes.map((opt: PipeType, index: number) => (
              <div key={opt.id} className="admin-field-inline">
                <label>
                  {opt.label} ({opt.sectionM} m):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={opt.sectionM}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const types = [...(calc?.pipes.pipeTypes ?? [])];
                    types[index] = { ...types[index], sectionM: val };
                    setCalc((prev) => ({
                      ...prev!,
                      pipes: { ...prev!.pipes, pipeTypes: types },
                    }));
                  }}
                  disabled={saving}
                  className="admin-input admin-input-small"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h2>Roofing</h2>
          <div className="admin-field">
            <label>Default Wastage Percent:</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={calc?.roofing.defaultWastagePercent ?? 0}
              onChange={(e) => handleChange("roofing", "defaultWastagePercent", parseFloat(e.target.value) || 0)}
              disabled={saving}
              className="admin-input"
            />
          </div>
          <div className="admin-field">
            <label>Tile Types (Tiles Per M2):</label>
            {calc?.roofing.tileTypes.map((opt: TileType, index: number) => (
              <div key={opt.id} className="admin-field-inline">
                <label>
                  {opt.label} ({opt.tilesPerM2} tiles/m²):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={opt.tilesPerM2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const types = [...(calc?.roofing.tileTypes ?? [])];
                    types[index] = { ...types[index], tilesPerM2: val };
                    setCalc((prev) => ({
                      ...prev!,
                      roofing: { ...prev!.roofing, tileTypes: types },
                    }));
                  }}
                  disabled={saving}
                  className="admin-input admin-input-small"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-mt">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          <Link href="/admin" className="admin-btn admin-btn-ghost ml-2">
            ← Back to Requests
          </Link>
        </div>
      </div>
    </>
  );
}